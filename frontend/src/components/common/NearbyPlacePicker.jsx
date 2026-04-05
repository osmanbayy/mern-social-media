import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { IoLocationOutline } from "react-icons/io5";
import { getNearbyPlaces, searchPlaces } from "../../api/places";

function formatDistanceM(m, hasUserCoords) {
  if (m == null || Number.isNaN(m)) return "—";
  if (m === 0 && !hasUserCoords) return "—";
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${m} m`;
}

/**
 * @param {{ value: { name: string, lat: number, lon: number } | null, onChange: (v: { name: string, lat: number, lon: number } | null) => void, disabled?: boolean, buttonClassName?: string, iconOnly?: boolean }} props
 */
export default function NearbyPlacePicker({ value, onChange, disabled, buttonClassName = "", iconOnly = false }) {
  const [open, setOpen] = useState(false);
  /** 'idle' | 'geo' | 'api' */
  const [loadPhase, setLoadPhase] = useState("idle");
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  /** Arama sonuçları (null = henüz yanıt yok veya arama modu değil) */
  const [searchResults, setSearchResults] = useState(null);
  const [searchRetryNonce, setSearchRetryNonce] = useState(0);
  /** Panel içi hata — toast kullanılmıyor (yanlış zamanda global bildirim oluşmasın) */
  const [panelError, setPanelError] = useState(null);
  /** Son istek başarılı ve API gövdesi işlendi; boş liste metni sadece buna göre */
  const [showEmptyHint, setShowEmptyHint] = useState(false);

  const wrapRef = useRef(null);
  const panelRef = useRef(null);
  const abortRef = useRef(null);
  const loadSeqRef = useRef(0);
  const [panelPos, setPanelPos] = useState(null);
  /** Konum alındıktan sonra arama ve mesafe için */
  const [userCoords, setUserCoords] = useState(null);

  const loading = loadPhase !== "idle";
  const inSearch = searchQuery.trim().length >= 2;
  const hasUserCoords = userCoords != null;

  const updatePanelPosition = useCallback(() => {
    const el = wrapRef.current;
    if (!el || !open) return;
    const r = el.getBoundingClientRect();
    const width = Math.min(window.innerWidth - 24, 320);
    let left = r.left;
    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - width - 8);
    } else if (left < 8) {
      left = 8;
    }
    const top = r.bottom + 8;
    setPanelPos({ top, left, width });
  }, [open]);

  useLayoutEffect(() => {
    if (!open) {
      setPanelPos(null);
      return;
    }
    updatePanelPosition();
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => updatePanelPosition();
    const onResize = () => updatePanelPosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      const t = e.target;
      if (wrapRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults(null);
      setSearchLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!open) return;
    const q = searchQuery.trim();
    if (q.length < 2) return;

    let cancelled = false;
    const ac = new AbortController();
    const tid = setTimeout(async () => {
      setSearchLoading(true);
      setPanelError(null);
      try {
        const data = await searchPlaces(q, userCoords?.lat, userCoords?.lon, ac.signal);
        if (cancelled) return;
        setSearchResults(data.places || []);
      } catch (e) {
        if (cancelled || e?.name === "AbortError" || e?.code === 20) return;
        const msg =
          typeof e?.message === "string" && e.message.trim()
            ? e.message
            : "Arama yapılamadı.";
        setPanelError(msg);
        setSearchResults([]);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(tid);
      ac.abort();
    };
  }, [searchQuery, open, userCoords, searchRetryNonce]);

  const geoMessage = (err) => {
    const code = err?.code;
    if (code === 1) {
      return "Konum izni reddedildi. Site ayarlarından konuma izin verin.";
    }
    if (code === 2) {
      return "Konum şu an alınamıyor (ağ/Wi‑Fi konumu kapalı olabilir).";
    }
    if (code === 3) {
      return "Konum zaman aşımına uğradı. Tekrar deneyin veya daha iyi sinyal bekleyin.";
    }
    return err?.message || "Konum alınamadı.";
  };

  const loadNearby = () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const seq = ++loadSeqRef.current;

    setPanelError(null);
    setShowEmptyHint(false);
    setNearbyPlaces([]);
    setUserCoords(null);

    if (!navigator.geolocation) {
      setLoadPhase("idle");
      setPanelError("Tarayıcınız konum paylaşımını desteklemiyor.");
      return;
    }
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setLoadPhase("idle");
      setPanelError(
        "Konum bu adreste kullanılamıyor. Geliştirmede http://localhost kullanın veya HTTPS ile yayınlayın."
      );
      return;
    }

    setLoadPhase("geo");

    const baseOpts = {
      enableHighAccuracy: false,
      timeout: 28000,
      maximumAge: 120000,
    };

    const finishIfStale = () => seq !== loadSeqRef.current;

    const fetchPlaces = async (lat, lon) => {
      if (finishIfStale()) return;
      setLoadPhase("api");
      setPanelError(null);
      const data = await getNearbyPlaces(lat, lon, ac.signal);
      if (finishIfStale()) return;
      const list = data.places || [];
      setUserCoords({ lat, lon });
      setNearbyPlaces(list);
      setShowEmptyHint(list.length === 0);
    };

    const onApiError = (e) => {
      if (e?.name === "AbortError" || e?.code === 20) return;
      if (finishIfStale()) return;
      const msg =
        typeof e?.message === "string" && e.message.trim()
          ? e.message
          : "Yakındaki yerler alınamadı. Bir süre sonra tekrar deneyin.";
      setPanelError(msg);
      setNearbyPlaces([]);
      setUserCoords(null);
      setShowEmptyHint(false);
    };

    const clearLoading = () => {
      if (finishIfStale()) return;
      setLoadPhase("idle");
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (finishIfStale()) return;
        try {
          await fetchPlaces(pos.coords.latitude, pos.coords.longitude);
        } catch (e) {
          onApiError(e);
        } finally {
          clearLoading();
        }
      },
      (err) => {
        if (err?.code === 3 || err?.code === 2) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              if (finishIfStale()) return;
              try {
                await fetchPlaces(pos.coords.latitude, pos.coords.longitude);
              } catch (e) {
                onApiError(e);
              } finally {
                clearLoading();
              }
            },
            (err2) => {
              if (finishIfStale()) return;
              setLoadPhase("idle");
              setPanelError(geoMessage(err2));
              setShowEmptyHint(false);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
          );
          return;
        }
        if (finishIfStale()) return;
        setLoadPhase("idle");
        setPanelError(geoMessage(err));
        setShowEmptyHint(false);
      },
      baseOpts
    );
  };

  const handleToggle = () => {
    if (open) {
      abortRef.current?.abort();
      setLoadPhase("idle");
      setPanelError(null);
      setShowEmptyHint(false);
      setSearchQuery("");
      setSearchResults(null);
      setSearchLoading(false);
      setOpen(false);
      return;
    }
    setSearchQuery("");
    setSearchResults(null);
    setSearchLoading(false);
    setOpen(true);
    loadNearby();
  };

  const baseBtn = iconOnly
    ? "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-transparent bg-base-200/60 text-base-content/70 " +
      "transition-all duration-200 hover:bg-primary/15 hover:text-primary " +
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
      "disabled:pointer-events-none disabled:opacity-50 dark:bg-base-300/40 dark:hover:bg-primary/15"
    : "inline-flex h-10 items-center gap-2 rounded-xl border border-base-300 bg-base-200 px-3 text-sm font-medium text-base-content " +
      "transition-all duration-200 hover:border-primary hover:bg-base-300 hover:text-base-content " +
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
      "disabled:pointer-events-none disabled:opacity-50 dark:border-base-300 dark:bg-base-300 dark:hover:border-primary dark:hover:bg-base-200";

  const selectedRing = iconOnly
    ? value
      ? "border-primary bg-primary/10 text-primary dark:bg-primary/15"
      : ""
    : value
      ? "border-primary bg-base-300 text-primary dark:bg-base-200"
      : "";

  const titleText = value?.name ? `Konum: ${value.name}` : "Konum ekle";

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        title={titleText}
        className={`${baseBtn} ${selectedRing} ${buttonClassName}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={value ? `Seçili konum: ${value.name}` : "Konum ekle"}
      >
        <IoLocationOutline className="h-5 w-5 shrink-0" />
        {!iconOnly && (
          <span className="max-w-[140px] truncate sm:max-w-[200px]">
            {value ? value.name : "Konum ekle"}
          </span>
        )}
      </button>

      {open &&
        panelPos &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              top: panelPos.top,
              left: panelPos.left,
              width: panelPos.width,
            }}
            className="z-[200000] isolate overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_22px_50px_-12px_rgba(0,0,0,0.28)] dark:border-zinc-700 dark:bg-zinc-950 dark:shadow-[0_22px_50px_-12px_rgba(0,0,0,0.55)]"
            role="listbox"
          >
          {/* Tam opak yüzeyler: Daisy base-* tema değişkenleri saydam olabildiği için neutral/white sabit tonları */}
          <div className="border-b border-neutral-200 bg-neutral-100 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-content shadow-sm">
                <IoLocationOutline className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600 dark:text-zinc-400">
                  Yakın yerler
                </p>
                <p className="truncate text-sm font-medium text-neutral-900 dark:text-zinc-100">
                  Konumunuza göre
                </p>
              </div>
            </div>
            <label className="mt-3 block">
              <span className="sr-only">Konum ara</span>
              <input
                type="search"
                autoComplete="off"
                placeholder="Mahalle, ilçe veya şehir ara…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered input-sm mt-0 w-full rounded-xl border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </label>
          </div>

          <div className="max-h-72 overflow-y-auto overscroll-contain bg-white dark:bg-zinc-950">
            {panelError && (!loading || inSearch) && !(inSearch && searchLoading) && (
              <div className="m-3 rounded-xl border border-red-500 bg-neutral-100 p-3 dark:border-red-600 dark:bg-zinc-900">
                <p className="text-sm leading-relaxed text-red-600 dark:text-red-400">{panelError}</p>
                <button
                  type="button"
                  className="mt-3 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-content transition hover:brightness-110"
                  onClick={() => {
                    setPanelError(null);
                    if (inSearch && searchQuery.trim().length >= 2) {
                      setSearchRetryNonce((n) => n + 1);
                    } else {
                      loadNearby();
                    }
                  }}
                >
                  Tekrar dene
                </button>
              </div>
            )}

            {loading && !inSearch && (
              <div className="min-h-[9rem] bg-white px-4 py-4 dark:bg-zinc-950">
                <div className="flex items-start gap-3">
                  <span className="loading loading-spinner loading-md shrink-0 text-primary" />
                  <div className="min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-neutral-900 dark:text-zinc-100">
                      {loadPhase === "geo" ? "Konum alınıyor" : "Yerler yükleniyor"}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-600 dark:text-zinc-400">
                      {loadPhase === "geo"
                        ? "Cihaz konumunuz isteniyor…"
                        : "Liste hazırlanıyor, biraz sürebilir…"}
                    </p>
                  </div>
                </div>
                {loadPhase === "api" && (
                  <div className="mt-4 space-y-2.5" aria-hidden>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-10 animate-pulse rounded-xl bg-neutral-200 dark:bg-zinc-800"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {inSearch && searchLoading && searchResults === null && (
              <div className="space-y-2.5 bg-white px-4 py-4 dark:bg-zinc-950" aria-busy>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 animate-pulse rounded-xl bg-neutral-200 dark:bg-zinc-800"
                  />
                ))}
              </div>
            )}

            {!loading &&
              !inSearch &&
              !panelError &&
              nearbyPlaces.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="option"
                  className="group flex w-full items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-neutral-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                  onClick={() => {
                    onChange({ name: p.name, lat: p.lat, lon: p.lon });
                    setOpen(false);
                  }}
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-900 dark:text-zinc-100">
                    {p.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-neutral-200 px-2.5 py-1 text-xs font-semibold tabular-nums text-neutral-800 dark:bg-zinc-800 dark:text-zinc-200">
                    {formatDistanceM(p.distanceM, hasUserCoords)}
                  </span>
                </button>
              ))}

            {inSearch &&
              !searchLoading &&
              searchResults &&
              !panelError &&
              searchResults.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="option"
                  className="group flex w-full items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-neutral-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                  onClick={() => {
                    onChange({ name: p.name, lat: p.lat, lon: p.lon });
                    setOpen(false);
                  }}
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-900 dark:text-zinc-100">
                    {p.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-neutral-200 px-2.5 py-1 text-xs font-semibold tabular-nums text-neutral-800 dark:bg-zinc-800 dark:text-zinc-200">
                    {formatDistanceM(p.distanceM, hasUserCoords)}
                  </span>
                </button>
              ))}

            {!loading && !inSearch && !panelError && showEmptyHint && nearbyPlaces.length === 0 && (
              <p className="bg-white px-4 py-6 text-center text-sm text-neutral-700 dark:bg-zinc-950 dark:text-zinc-300">
                Bu konumda yakın isimli yer bulunamadı.
                <span className="mt-1 block text-xs text-neutral-500 dark:text-zinc-500">
                  Menüyü kapatıp tekrar deneyebilirsiniz.
                </span>
              </p>
            )}

            {inSearch && !searchLoading && searchResults && searchResults.length === 0 && !panelError && (
              <p className="bg-white px-4 py-6 text-center text-sm text-neutral-700 dark:bg-zinc-950 dark:text-zinc-300">
                Aramanızla eşleşen yer bulunamadı.
                <span className="mt-1 block text-xs text-neutral-500 dark:text-zinc-500">
                  Farklı bir anahtar kelime deneyin.
                </span>
              </p>
            )}

            {value && (
              <div className="border-t border-neutral-200 bg-neutral-100 dark:border-zinc-800 dark:bg-zinc-900">
                <button
                  type="button"
                  className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-neutral-200 dark:text-red-400 dark:hover:bg-zinc-800"
                  onClick={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                >
                  Konumu kaldır
                </button>
              </div>
            )}
          </div>
        </div>,
          document.body
        )}
    </div>
  );
}

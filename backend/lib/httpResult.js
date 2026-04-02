/** Servis katmanından controller'a dönen standart sonuç */
export function ok(status, data) {
  return { ok: true, status, data };
}

export function fail(status, message, extra = {}) {
  return { ok: false, status, message, ...extra };
}

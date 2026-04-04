import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useFollowListTab(username) {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = location.pathname.endsWith("/following") ? "following" : "followers";

  const setTab = useCallback(
    (tab) => {
      navigate(`/profile/${username}/${tab}`, { replace: true });
    },
    [navigate, username]
  );

  return { activeTab, setTab };
}

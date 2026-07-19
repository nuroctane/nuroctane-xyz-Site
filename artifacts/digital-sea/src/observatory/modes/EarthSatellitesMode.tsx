/** Sealed Orbit Veil runtime — full CelesTrak/SGP4 satellite field. */
export function EarthSatellitesMode() {
  return (
    <iframe
      className="obs-sat-frame"
      src="/orbit-veil-runtime/index.html"
      title="Orbit Veil real-time satellite tracker"
      allow="fullscreen"
    />
  );
}

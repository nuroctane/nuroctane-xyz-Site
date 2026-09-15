/** Sealed Observatory runtime — full CelesTrak/SGP4 satellite field. */
export function EarthSatellitesMode() {
  return (
    <iframe
      className="obs-sat-frame"
      src="/observatory-runtime/index.html"
      title="Observatory real-time satellite tracker"
      allow="fullscreen"
    />
  );
}

interface SeriesBackgroundProps {
  bgUrl: string;
}

export function SeriesBackground({ bgUrl }: SeriesBackgroundProps) {
  return (
    <>
      {/* Full-bleed background image */}
      <div className="fixed left-0 top-0 z-0 h-screen w-full pointer-events-none">
        <img
          src={bgUrl}
          alt="Background"
          className="h-full w-full object-cover object-top opacity-40 dark:opacity-100"
          loading="eager"
        />
      </div>
      {/* Dark gradient overlay */}
      <div
        className="fixed left-0 top-0 z-0 h-full w-full pointer-events-none"
        style={{
          background:
            "linear-gradient(rgba(10,10,10,0.5), rgba(10,10,10,0.9), #0a0a0a)",
        }}
      />
    </>
  );
}

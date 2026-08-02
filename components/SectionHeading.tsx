import Reveal from "./Reveal";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <Reveal
      className={align === "center" ? "text-center mx-auto max-w-2xl" : ""}
    >
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ivory leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-muted text-base sm:text-lg leading-relaxed max-w-xl">
          {description}
        </p>
      )}
    </Reveal>
  );
}

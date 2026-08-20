import { NavLink } from "react-router-dom";

export default function BrandLogo({
  to,
  clickable = false,
  className = "",
  logoClassName = "",
  titleClassName = "",
  subtitleClassName = "",
}) {
  const content = (
    <>
      <div
        className={`font-serif font-bold leading-none tracking-[-0.04em] text-[#c28a13] ${logoClassName}`}
      >
        SG
      </div>

      <strong
        className={`font-serif font-bold tracking-[0.16em] text-[#211b62] ${titleClassName}`}
      >
        SAM GLOBAL
      </strong>

      <span
        className={`font-medium tracking-[0.14em] text-[#9c741e] ${subtitleClassName}`}
      >
        Enterprise Solutions
      </span>
      
    </>
  );

  if (clickable && to) {
    return (
      <NavLink
        to={to}
        className={`flex flex-col items-center justify-center text-center no-underline ${className}`}
      >
        {content}
      </NavLink>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${className}`}
    >
      {content}
    </div>
  );
}
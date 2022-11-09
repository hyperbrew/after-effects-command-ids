import "./badge.scss";

import icon from "./hb-icon.svg";

export const Badge = () => {
  return (
    <a
      className="badge"
      title="Powered by Hyper Brew"
      href="https://hyperbrew.co"
    >
      <p className="badge-description">powered by Hyper Brew</p>
      <img className="badge-icon" src={icon} alt="Hyper Brew" />
    </a>
  );
};

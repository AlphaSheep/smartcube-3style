import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

export function Footer() {
  return (
    <a href="https://github.com/AlphaSheep/smartcube-3style" target="_blank" rel="noopener noreferrer">
      <FontAwesomeIcon icon={faGithub} />
      <span>Github</span>
    </a>
  );
}


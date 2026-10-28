import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faYoutube } from "@fortawesome/free-brands-svg-icons";

import './footer.less';

export function Footer() {
  return (
    <footer className="footer">
      <span className="shrink-mobile">
        Built with 💚 by <a href="https://bgray.dev" target="_blank" rel="noreferrer">Brendan&nbsp;James&nbsp;Gray</a>
      </span>
      <span className="footer-links">
        <a href="https://www.youtube.com/playlist?list=PLftJ72HO33raHwfM-rS2JMbPPiFAa-Iw-" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faYoutube} />
          <span className="hide-mobile">YouTube</span>
        </a>
        <a href="https://github.com/AlphaSheep/smartcube-3style" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faGithub} />
          <span className="hide-mobile">GitHub</span>
        </a>
      </span>
    </footer>
  );
}


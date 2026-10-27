import React from 'react';

/**
 * TODO_LOADER — trocar pela metáfora do segmento da loja antes do primeiro
 * preview. Costura é o ponto de partida para moda; farmácia, autopeças e
 * mercado pedem outro gesto. Cores vêm dos tokens, não daqui.
 */
export default function BrandLoader() {
  return (
    <svg className="krc-loader" width="160" height="48" viewBox="0 0 160 48" aria-hidden="true">
      <line className="krc-loader-track" x1="8" y1="24" x2="152" y2="24" />
      <line className="krc-loader-stitch" x1="8" y1="24" x2="152" y2="24" />
    </svg>
  );
}

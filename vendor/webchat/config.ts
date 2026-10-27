import type { AppConfig } from './App';

// `channelUuid` is the WWC channel id (the config object of the channel), not
// the integration id that appears in the official snippet's script.js URL.
export const DEFAULT_CONFIG: AppConfig = {
  socketUrl: 'wss://websocket.weni.ai/ws',
  flowsOrigin: 'https://flows.weni.ai',
  channelUuid: '39cba1da-7547-4cac-8410-f5426738d8f5',
  vtexAccount: 'karcher',
  title: 'Assistente Kärcher',
  subtitle: 'Especialista em produtos Kärcher',
  launcherLabel: 'Assistente Kärcher',
  inputPlaceholder: 'Pergunte sobre produtos, pedidos...',
  inputHints: [
    'Onde está meu pedido?',
    'Sugestões de presente para meu pai',
    'Robô aspirador 110V',
    'Lavadora de alta pressão até R$ 600',
    'Quero dicas de manutenção pro meu equipamento',
    'Aspirador com 1400W',
  ],
  greeting:
    'Olá! Posso te ajudar a encontrar o produto ideal, verificar compatibilidade de acessórios, rastrear pedidos ou tirar dúvidas de uso. Como posso ajudar?',
  quickActions: [
    { icon: 'search', label: 'Encontrar produto ideal', text: 'Quero encontrar o produto ideal para mim' },
    { icon: 'grid', label: 'Verificar compatibilidade', text: 'Quero verificar a compatibilidade de um acessório' },
    { icon: 'truck', label: 'Rastrear meu pedido', text: 'Quero rastrear meu pedido' },
    { icon: 'wrench', label: 'Dicas de manutenção', text: 'Quero dicas de manutenção do meu equipamento' },
  ],
};

declare global {
  interface Window {
    /**
     * Optional overrides. Set before the script runs in the console build, or
     * written by the IO app's pixel/body.html from the app settings.
     */
    WebchatDemo?: { config?: Partial<AppConfig>; disabled?: boolean };
  }
}

/** Defaults, then whatever the page set on `window.WebchatDemo.config`. */
export function resolveConfig(): AppConfig {
  const overrides = window.WebchatDemo?.config ?? {};
  // An empty string means "not configured" (an unset app setting renders as ""),
  // never "blank this field".
  const set = Object.fromEntries(Object.entries(overrides).filter(([, v]) => v !== '' && v != null));
  return { ...DEFAULT_CONFIG, ...set };
}

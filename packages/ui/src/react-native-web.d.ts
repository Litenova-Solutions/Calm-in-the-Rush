declare module 'react-native-web' {
  export function unstable_createElement(
    component: string,
    props?: Record<string, unknown>,
    options?: Record<string, unknown>,
  ): import('react').ReactElement;
}

export function useBaseCurrency() {
  const {
    public: { baseCurrency },
  } = useRuntimeConfig();
  return baseCurrency as string;
}

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // src/lib/supabase tira error si faltan las claves, y se importa en
    // cadena desde gastos. Los tests no tocan la red: alcanzan valores
    // dummy para que el módulo cargue.
    env: {
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    },
  },
})

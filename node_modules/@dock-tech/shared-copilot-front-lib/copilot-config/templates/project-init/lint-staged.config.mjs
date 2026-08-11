// lint-staged — roda o ESLint (com as regras dock-ds) só nos arquivos staged.
// Rápido o suficiente para pre-commit; o gate completo (validate:design,
// validate:contrast) roda no CI. Ver .github/workflows/frontend-quality.yml.
export default {
  '*.{vue,ts,js}': ['eslint --fix'],
}

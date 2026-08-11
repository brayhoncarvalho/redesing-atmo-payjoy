<script setup lang="ts">
import { ref, defineComponent, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const expanded = ref(false)

interface NavItem {
  label: string
  icon: string
  children?: { label: string; to: string }[]
  to?: string
}

const navItems: NavItem[] = [
  { label: 'Registros',        icon: 'registros',        children: [] },
  { label: 'Archivos',         icon: 'archivos',         children: [] },
  { label: 'Soporte',          icon: 'soporte',          children: [] },
  {
    label: 'Pagos',
    icon: 'pagos',
    children: [
      { label: 'Multipagos',              to: '/multipagos' },
      { label: 'Pagos PayJoy',            to: '/pagos-payjoy' },
      { label: 'Pagos PayJoy V2',         to: '/pagos-payjoy-v2' },
      { label: 'Historial de pagos',      to: '/historial-pagos' },
      { label: 'Historial de pagos V2',   to: '/historial-pagos-v2' },
    ],
  },
  {
    label: 'Financiamientos',
    icon: 'financiamientos',
    children: [
      { label: 'Iniciar solicitud',      to: '/iniciar-solicitud' },
      { label: 'Historial de propuestas', to: '/historial-propuestas' },
    ],
  },
  { label: 'Consulta del IMEI',   icon: 'imei',  to: '/consulta-imei' },
  { label: 'Validar orden onix',  icon: 'onix',  to: '/validar-onix' },
]

const openMenu = ref<string | null>('Pagos')

function toggleSidebar() {
  expanded.value = !expanded.value
  if (!expanded.value) openMenu.value = null
}

function toggleMenu(label: string) {
  if (!expanded.value) expanded.value = true
  openMenu.value = openMenu.value === label ? null : label
}

function navigate(to: string) {
  router.push(to)
}

function isActive(to: string) {
  return route.path === to
}

function isParentActive(item: NavItem) {
  return item.children?.some(c => c.to && isActive(c.to))
}

// ── Ícones SVG inline ──────────────────────────────────────────────────────
const iconPaths: Record<string, string> = {
  registros:       'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M9 13h6M9 17h4',
  archivos:        'M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
  soporte:         'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  pagos:           'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  financiamientos: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  imei:            'M21 21l-4.35-4.35m0 0A7 7 0 105.65 5.65a7 7 0 0011 11z',
  onix:            'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
}

const SidebarIcon = defineComponent({
  props: { name: { type: String, required: true } },
  render() {
    return h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true', style: 'flex-shrink:0' }, [
      h('path', { d: iconPaths[this.name] ?? '', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
    ])
  },
})
</script>

<template>
  <nav
    class="sidebar"
    :class="{ 'sidebar--expanded': expanded }"
    role="navigation"
    aria-label="Menú principal"
  >
    <!-- Área de menu com fundo #f4f4f6 -->
    <div class="sidebar__inner">

      <!-- Botão toggle (hambúrguer) -->
      <button
        class="sidebar__toggle"
        :aria-expanded="expanded"
        aria-label="Expandir menú"
        @click="toggleSidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>

      <!-- Items de menu -->
      <ul role="list" class="sidebar__list">
        <li
          v-for="item in navItems"
          :key="item.label"
          class="sidebar__item"
        >
          <!-- Com filhos (accordion) -->
          <template v-if="item.children && item.children.length">
            <button
              class="sidebar__row"
              :class="{ 'sidebar__row--active': isParentActive(item) }"
              :aria-expanded="expanded && openMenu === item.label"
              @click="toggleMenu(item.label)"
            >
              <SidebarIcon :name="item.icon" />
              <span v-if="expanded" class="sidebar__label">{{ item.label }}</span>
              <svg
                v-if="expanded"
                class="sidebar__chevron"
                :class="{ 'sidebar__chevron--up': openMenu === item.label }"
                width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
              >
                <path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <!-- Submenu (só visível quando expandido E aberto) -->
            <ul
              v-if="expanded && openMenu === item.label"
              role="list"
              class="sidebar__submenu"
            >
              <li v-for="child in item.children" :key="child.label">
                <button
                  class="sidebar__child"
                  :class="{ 'sidebar__child--active': isActive(child.to) }"
                  @click="navigate(child.to)"
                >
                  {{ child.label }}
                </button>
              </li>
            </ul>
          </template>

          <!-- Sem filhos -->
          <template v-else>
            <button
              class="sidebar__row"
              :class="{ 'sidebar__row--active': item.to && isActive(item.to) }"
              @click="item.to && navigate(item.to)"
            >
              <SidebarIcon :name="item.icon" />
              <span v-if="expanded" class="sidebar__label">{{ item.label }}</span>
            </button>
          </template>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
/* ── Sidebar shell ── */
.sidebar {
  width: 72px;
  height: 100vh;
  background-color: #ffffff;
  flex-shrink: 0;
  transition: width 0.3s ease-in-out;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.06);
  z-index: 20;
}

.sidebar--expanded {
  width: 280px;
}

/* ── Inner container com fundo #f4f4f6 (mesmo do ATMO) ── */
.sidebar__inner {
  background-color: #f4f4f6;
  margin: 4px;
  padding: 12px;
  border-radius: 12px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ── Toggle hambúrguer ── */
.sidebar__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: var(--color-gray-700);
  margin-bottom: 8px;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}

.sidebar__toggle:hover {
  background-color: #eaf2fe;
  color: #669df1;
}

/* ── Lista ── */
.sidebar__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar__item { position: relative; }

/* ── Row (item principal) ── */
.sidebar__row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 400;
  color: var(--color-gray-900);
  font-family: var(--font-body);
  text-align: left;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s;
}

.sidebar__row:hover,
.sidebar__row--active {
  background-color: #eaf2fe;
  color: #669df1;
}

.sidebar__row--active {
  font-weight: 600;
}

/* ── Label (só aparece quando expanded) ── */
.sidebar__label {
  flex: 1;
  transition: opacity 0.2s;
}

/* ── Chevron ── */
.sidebar__chevron {
  color: currentColor;
  transition: transform 0.25s ease;
}
.sidebar__chevron--up { transform: rotate(180deg); }

/* ── Submenu ── */
.sidebar__submenu {
  list-style: none;
  padding: 2px 0 2px 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.sidebar__child {
  width: 100%;
  display: block;
  padding: 8px 12px 8px 44px;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--color-gray-700);
  font-family: var(--font-body);
  text-align: left;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}

.sidebar__child:hover,
.sidebar__child--active {
  background-color: #eaf2fe;
  color: #669df1;
}

.sidebar__child--active { font-weight: 600; }
</style>


<template>
  <header class="topbar" role="banner">
    <div class="topbar__brand">
      <img
        src="/payjoy-logo.png"
        alt="PayJoy"
        class="topbar__logo"
      />
    </div>
    <div class="topbar__user">
      <span class="topbar__store">CAC TAPACHULA &middot; PDV 21050015</span>
      <div class="topbar__profile">
        <div class="topbar__avatar" aria-hidden="true">CG</div>
        <span class="topbar__username">camila.graciano</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
  z-index: 10;
}

.topbar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.topbar__logo {
  height: 32px;
  width: auto;
  object-fit: contain;
}

.topbar__user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.topbar__store {
  font-size: 13px;
  color: var(--color-text-muted, #6b7280);
  font-weight: 500;
}

.topbar__profile {
  display: flex;
  align-items: center;
  gap: 8px;
}

.topbar__avatar {
  width: 32px;
  height: 32px;
  background: #2196f3;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.topbar__username {
  font-size: 13px;
  color: var(--color-text, #1f2937);
  font-weight: 500;
}

.topbar__title {
  font-size: 16px;
  font-family: var(--font-heading);
  font-weight: 600;
  color: var(--color-gray-900);
  white-space: nowrap;
}
</style>

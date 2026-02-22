---
layout: home

hero:
  name: Net Worth Tracker
  text: Simple. Local. Yours.
  tagline: Track your net worth over time across all account types — no subscriptions, no cloud, no complexity.
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: Development Setup
      link: /development

features:
  - icon: 🏦
    title: Account Management
    details: Create and manage accounts across types — stocks, cash, crypto, real estate, bonds, retirement, and more.
  - icon: 📈
    title: Value History
    details: Record total value snapshots per account. Full history is preserved so you can track your net worth evolution over time.
  - icon: 📊
    title: Dashboard Charts
    details: Visualise your net worth with an evolution line chart and an account type breakdown donut chart, powered by Chart.js.
  - icon: 🔮
    title: Growth Simulator
    details: Compound interest calculator with configurable initial amount, yearly rate, and time horizon — includes a projected growth chart.
  - icon: 🔒
    title: Single-User & Private
    details: No authentication required. Your data stays local, stored in a single SQLite file that you own and control.
  - icon: 🐳
    title: Docker-First Deployment
    details: Ship as a single container. One volume mount for persistence, one port to expose. Zero external dependencies.
---

## Screenshots

<div class="screenshots">
  <div class="screenshot-item">
    <img src="./screenshots/dashboard.png" alt="Dashboard" />
    <p>Dashboard</p>
  </div>
  <div class="screenshot-item">
    <img src="./screenshots/accounts.png" alt="Accounts" />
    <p>Accounts</p>
  </div>
  <div class="screenshot-item">
    <img src="./screenshots/simulator.png" alt="Growth Simulator" />
    <p>Growth Simulator</p>
  </div>
</div>

<style>
.screenshots {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 2rem 0;
}

.screenshot-item {
  text-align: center;
}

.screenshot-item img {
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.screenshot-item p {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

@media (max-width: 768px) {
  .screenshots {
    grid-template-columns: 1fr;
  }
}
</style>

# Hola Web

[English](./README.md)

基于**元编程**理念的 Vue 3 组件库，从实体元数据自动生成 CRUD 界面。使用 **Vue 3 + Vuetify 3 + ECharts** 构建，与 [hola-server](https://github.com/hery-node/hola-server) 无缝集成。

## ✨ 特性

- **26 个生产级组件** — 表格、表单、图表、导航、对比等
- **元数据驱动 UI** — 从服务端实体元数据自动生成 CRUD 界面
- **8 个组合式函数** — 可复用的元数据、通知、图表、搜索、验证和快捷键逻辑
- **双 API 客户端** — Axios 封装 + Eden Treaty 端到端类型安全 API 调用
- **可扩展类型系统** — 客户端类型注册，支持验证规则、格式化和输入类型
- **Vuetify 3** — Material Design 风格，25+ 自定义主题色和可移动对话框
- **ECharts 集成** — 折线图、柱状图、饼图、组合图和仪表盘图表组件
- **国际化** — 内置中英文多语言支持
- **类库构建** — 输出 ESM + UMD 格式，包含 TypeScript 声明和 CSS

## 📦 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | [Vue 3](https://vuejs.org)（组合式 API） |
| UI 库 | [Vuetify 3](https://vuetifyjs.com) 3.7+ |
| 图表 | [ECharts](https://echarts.apache.org) 5.5+ / [Chartist](https://gionkunz.github.io/chartist-js/) |
| HTTP 客户端 | [Axios](https://axios-http.com) / [Eden Treaty](https://elysiajs.com/eden/treaty) |
| 状态管理 | [Pinia](https://pinia.vuejs.org) |
| 国际化 | [vue-i18n](https://vue-i18n.intlify.dev) 11+ |
| 构建工具 | [Vite](https://vitejs.dev) 6+ |
| 运行时 | [Bun](https://bun.sh) |

## 🚀 快速开始

### 安装

```bash
bun add hola-web
```

### 对等依赖

hola-web 需要以下依赖包：

```bash
# npm
npm install vue vuetify @mdi/font pinia vue-router vue-i18n axios

# bun
bun add vue vuetify @mdi/font pinia vue-router vue-i18n axios
```

| 包名 | 版本 | 用途 |
|------|------|------|
| `vue` | ^3.5.0 | 核心框架 |
| `vuetify` | ^3.7.0 | UI 组件库 |
| `@mdi/font` | ^7.4.0 | Material Design 图标 |
| `pinia` | ^2.2.0 | 状态管理 |
| `vue-router` | ^4.4.0 | 客户端路由 |
| `vue-i18n` | ^11.2.8 | 国际化 |
| `axios` | ^1.7.0 | HTTP 客户端 |

可选依赖（使用图表时需要）：

```bash
npm install echarts vue-echarts
```

### 样式配置

hola-web **不**打包 Vuetify 样式，需要在 `main.ts` 中单独引入：

```typescript
import 'vuetify/styles'                         // Vuetify 样式（必需）
import '@mdi/font/css/materialdesignicons.css'   // Material Design 图标（必需）
import 'hola-web/style.css'                      // hola-web 组件样式
```

### 应用配置

```typescript
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { initApp, initAxios, loadLocaleMessagesEager } from "hola-web";

// 样式
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import 'hola-web/style.css'

// 加载语言文件
const localeModules = import.meta.glob("./locales/*.json", { eager: true });
const messages = loadLocaleMessagesEager(localeModules);

// 配置 API 客户端
initAxios({ baseURL: "http://localhost:8089" });

// 创建并初始化应用
const app = createApp(App);
app.use(createPinia());

initApp(app, {
  localeMessages: messages,
  locale: "en",
});

app.mount("#app");
```

### 基本用法

用一个组件创建完整的 CRUD 页面：

```vue
<template>
  <h-crud :entity="entity" :item-label-key="itemLabelKey"
    :sort-key="sortKey" :sort-desc="sortDesc" />
</template>

<script setup lang="ts">
const entity = "user";
const itemLabelKey = "name";
const sortKey = ["name"];
const sortDesc = [false];
</script>
```

`h-crud` 组件会自动：
- 从服务端加载实体元数据
- 渲染带排序和分页的数据表格
- 提供创建、编辑、克隆和删除对话框
- 内部处理所有 API 调用

## 🧩 组件

### 核心组件

| 标签 | 组件 | 说明 |
|------|------|------|
| `h-crud` | CrudTable | 完整 CRUD 操作，支持行内编辑 |
| `h-table` | DataTable | 数据表格，支持排序、分页、搜索 |
| `h-form` | BasicForm | 带验证的简单表单 |
| `h-edit-form` | EditForm | 元数据感知的实体编辑表单 |
| `h-search` | SearchForm | 实体过滤搜索表单 |
| `h-list` | DataList | 移动端友好的列表视图 |

### 表格组件

| 标签 | 组件 | 说明 |
|------|------|------|
| `h-array` | ArrayTable | 行内可编辑的数组表格 |
| `h-property` | PropertyTable | 键值属性展示 |
| `h-compare` | CompareTable | 实体并排对比 |
| `h-dashboard-table` | DashboardTable | 仪表盘摘要表格 |

### 图表组件

| 标签 | 组件 | 说明 |
|------|------|------|
| `h-chart` | ChartView | 通用 ECharts 封装 |
| `h-line-chart` | ChartLineView | 趋势折线图 |
| `h-bar-chart` | ChartBarView | 柱状图 |
| `h-pie-chart` | ChartPieView | 饼图/环形图 |
| `h-combo-chart` | ChartComboView | 多类型组合图表 |
| `h-simple-chart` | ChartSimpleView | 简单 Chartist 图表 |
| `h-dashboard-chart` | ChartDashboardView | 仪表盘图表面板 |

### 布局与导航

| 标签 | 组件 | 说明 |
|------|------|------|
| `h-window` | BasicWindow | 模态对话框窗口 |
| `h-confirm` | ConfirmDialog | 确认对话框 |
| `h-navbar` | NavBar | 顶部导航栏 |
| `h-mobile-menu` | MobileMenu | 移动端导航菜单 |
| `h-card` | CardView | 带操作的内容卡片 |
| `h-stats` | StatisticsView | 统计数据展示卡片 |
| `h-offset` | OffsetView | 偏移内容布局 |

### 实体组件

| 标签 | 组件 | 说明 |
|------|------|------|
| `h-array-entity` | ArrayEntity | 带数组子项的实体 |
| `h-compare-entity` | CompareEntity | 实体对比封装 |

## 🔧 组合式函数

| 组合式函数 | 用途 | 核心方法 |
|-----------|------|----------|
| `useMeta` | 实体元数据管理 | `loadMeta()`, `getTableHeaders()`, `getEditFields()`, `getSearchFields()` |
| `useAlert` | 通知和确认 | `showSuccess()`, `showError()`, `confirm()` |
| `useChart` | ECharts 集成 | `createChart()`，图表选项构建器 |
| `useFuzzy` | 模糊文本搜索/过滤 | `search()`，可配置匹配 |
| `useKeymap` | 键盘快捷键 | `bindKey()`，组合键 |
| `useRegex` | 正则验证辅助 | 模式匹配工具 |
| `useSimpleValue` | 简单响应式值 | getter/setter 辅助 |
| `useWrap` | 值包装/格式化 | 文本截断、格式化 |

## 🌐 API 客户端

### Axios 客户端

```typescript
import { initAxios, listEntity, saveEntity, deleteEntity } from "hola-web";

// 初始化
initAxios({ baseURL: "http://localhost:8089" });

// CRUD 操作
const { data, total } = await listEntity("user", searchForm, {
  page: 1, limit: 20, sortBy: "name", desc: "false", attrNames: "*"
});
await saveEntity("user", formData, false); // 创建
await saveEntity("user", formData, true);  // 更新
await deleteEntity("user", ["id1", "id2"]);
```

### Eden Treaty 客户端（类型安全）

```typescript
import { initEden, getEden, handleEdenResponse } from "hola-web";
import type { App } from "your-server/main";

// 使用服务端类型初始化
const api = initEden<App>({ baseUrl: "http://localhost:3000" });

// 类型安全的 API 调用
const result = handleEdenResponse(await api.user.meta.get());
```

## 🎨 主题定制

支持 25+ 语义化颜色标记：

```typescript
import { initApp } from "hola-web";

initApp(app, {
  locale: "en",
  localeMessages: messages,
  theme: {
    light: {
      primary: "#1976D2",
      secondary: "#424242",
      accent: "#82B1FF",
      create: "#4CAF50",
      edit: "#2196F3",
      delete: "#F44336",
      appBar: "#1976D2",
      tableHeader: "#E3F2FD",
      // ...更多
    },
  },
});
```

## 🌍 国际化

内置多语言支持，深度合并应用自定义翻译：

```typescript
import { setupI18n, loadLocaleMessagesEager, deepMerge } from "hola-web";

// 加载 hola-web 内置语言包 + 应用语言包
const holaMessages = loadLocaleMessagesEager(holaLocaleModules);
const appMessages = loadLocaleMessagesEager(appLocaleModules);

// 深度合并保留嵌套键
const merged = { en: deepMerge(holaMessages.en, appMessages.en) };
const i18n = setupI18n({ locale: "en", messages: merged });
```

## 📁 类型系统

客户端类型注册，用于表单验证、输入类型和格式化：

```typescript
import { registerType, getType, createEnumType } from "hola-web";

// 注册自定义枚举类型
registerType(createEnumType("status", [
  { value: 0, label: "活跃" },
  { value: 1, label: "停用" },
]));

// 内置类型：string, text, int, uint, float, decimal, percentage,
// currency, boolean, date, datetime, email, password, url, ip, file, array, enum
```

## 📂 项目结构

```
hola-web/
├── src/
│   ├── index.ts              # 公共 API 和插件入口
│   ├── main.ts               # 开发应用入口
│   ├── App.vue               # 开发应用根组件
│   ├── components/           # 26 个 Vue 组件
│   │   ├── CrudTable.vue     # 完整 CRUD 操作
│   │   ├── DataTable.vue     # 带分页的数据表格
│   │   ├── EditForm.vue      # 元数据感知编辑表单
│   │   ├── BasicForm.vue     # 简单表单组件
│   │   ├── ChartView.vue     # ECharts 封装
│   │   └── ...
│   ├── composables/          # 8 个 Vue 组合式函数
│   │   ├── useMeta.ts        # 实体元数据管理
│   │   ├── useAlert.ts       # 通知
│   │   ├── useChart.ts       # 图表工具
│   │   └── ...
│   ├── core/                 # 核心工具
│   │   ├── axios.ts          # Axios HTTP 客户端封装
│   │   ├── eden.ts           # Eden Treaty 客户端
│   │   ├── type.ts           # 类型系统和验证
│   │   ├── chart.ts          # 图表数据工具
│   │   ├── code.ts           # 响应码常量
│   │   └── storage.ts        # 本地存储辅助
│   ├── plugins/              # Vue 插件
│   │   ├── vuetify.ts        # Vuetify 3 配置
│   │   ├── i18n.ts           # Vue I18n 设置
│   │   └── echarts.ts        # ECharts 设置
│   ├── types/                # TypeScript 定义
│   ├── locales/              # 国际化翻译（中文、英文）
│   └── views/                # 开发演示视图
├── docs/                     # 文档
│   ├── COMPONENTS.md         # 组件参考
│   └── THEMING.md            # 主题定制指南
├── vite.config.ts            # Vite 构建配置（ESM + UMD）
├── package.json
└── tsconfig.json
```

## 🛠️ 开发

```bash
# 安装依赖
bun install

# 启动开发服务器
bun run dev

# 构建类库（ESM + UMD + 类型声明 + CSS）
bun run build

# 类型检查
bun run type-check

# 代码检查
bun run lint
```

## 📋 环境要求

- **运行时：** Bun 1.0+
- **Vue：** 3.5.0+
- **Vuetify：** 3.7.0+
- **浏览器：** 现代浏览器（Chrome, Firefox, Safari, Edge）

## 📄 许可证

MIT

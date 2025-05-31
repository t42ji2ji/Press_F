# Silkscreen 字体使用指南

## 已完成的更改

### 1. 添加 Google Fonts
在 `index.html` 中添加了 Silkscreen 字体：
```html
<!-- Google Fonts - Silkscreen -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap" rel="stylesheet">
```

### 2. 配置 Tailwind CSS
在 `tailwind.config.js` 中添加了字体家族：
```javascript
theme: {
  extend: {
    fontFamily: {
      'silkscreen': ['Silkscreen', 'monospace'],
    },
  },
}
```

### 3. 更新样式类
在 `src/main.css` 中：
- `.header` 类现在使用 Silkscreen 字体（用于所有标题）
- `#nextButton` 现在使用 Silkscreen 字体（用于主要按钮）
- 添加了新的实用类：
  - `.font-silkscreen-lg` - 大号 Silkscreen 字体 (text-2xl font-bold)
  - `.font-silkscreen-md` - 中号 Silkscreen 字体 (text-xl font-normal)
  - `.font-silkscreen-sm` - 小号 Silkscreen 字体 (text-lg font-normal)

### 4. 错误页面
在 `ErrorBoundary.module.css` 中更新了错误消息和按钮样式以使用 Silkscreen 字体。

## 如何使用

### 在 Tailwind 类中使用
```jsx
// 直接使用字体家族
<h1 className="font-silkscreen text-3xl">标题</h1>

// 使用预定义的实用类
<span className="font-silkscreen-lg">大标题</span>
<span className="font-silkscreen-md">中等文字</span>
<span className="font-silkscreen-sm">小文字</span>
```

### 在 CSS 中使用
```css
.my-custom-class {
  font-family: 'Silkscreen', monospace;
}
```

## 当前应用的位置

1. **所有页面标题** - 通过 `.header` 类自动应用
2. **主要按钮** - 通过 `#nextButton` ID 自动应用
3. **错误页面** - 错误消息和按钮现在使用 Silkscreen 字体

## 建议的其他应用位置

可以考虑在以下地方使用 Silkscreen 字体来突出重要信息：
- 用户名显示（如成功页面的 @handle）
- 重要的数据展示（如交易哈希）
- 特殊状态标签
- 游戏化元素或特殊 UI 组件

## 示例代码

```jsx
// 突出显示用户名
<span className="font-silkscreen-md text-violet-500">@{handle}</span>

// 重要的链接或标识符
<a className="font-silkscreen-sm text-violet-500 underline">
  {tx.slice(0, 6)}...{tx.slice(-4)}
</a>

// 特殊标签
<span className="font-silkscreen-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
  NFT
</span>
``` 
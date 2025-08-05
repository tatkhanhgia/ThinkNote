---
title: "Setting Up TypeScript with Next.js"
description: "A step-by-step guide to integrate TypeScript into your Next.js project for better type safety."
tags: ["TypeScript", "Next.js", "Setup"]
categories: ["Programming Languages", "DevCore", "Frameworks"]
date: "2023-11-05"
gradientFrom: "from-blue-500"
gradientTo: "to-indigo-500"
---

## Why TypeScript?
TypeScript adds static typing to JavaScript, which helps in catching errors early during development and improves code maintainability.

## Installation
\`\`\`bash
npm install --save-dev typescript @types/react @types/node
# or
yarn add --dev typescript @types/react @types/node
\`\`\`

Next, create a \`tsconfig.json\` file in your project root. Next.js will often do this for you automatically.

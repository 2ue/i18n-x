{
  "locale": "zh-CN",
  "fallbackLocale": "en-US",
  "outputDir": "locales",
  "include": [
    "src/**/*.{js,jsx,ts,tsx}",
    "pages/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}"
  ],
  "exclude": [
    "node_modules/**",
    "dist/**",
    "build/**",
    "**/*.d.ts",
    "**/*.test.{js,jsx,ts,tsx}",
    "**/*.spec.{js,jsx,ts,tsx}"
  ],
  "keyGeneration": {
    "maxChineseLength": 10,
    "hashLength": 6,
    "maxRetryCount": 5,
    "duplicateKeyStrategy": "reuse",
    "pinyinOptions": {
      "toneType": "none",
      "type": "array"
    }
  },
  "output": {
    "prettyJson": true,
    "localeFileName": "{locale}.json"
  }
}
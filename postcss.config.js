export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    "postcss-remove-rules": {
      rulesToRemove: {
        "img,\nvideo": "height",
      },
    },
  },
};

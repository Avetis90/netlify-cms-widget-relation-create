# Netlify CMS Widget For Relation Widgets with ability to create a new one





### Development

To run a copy of Netlify CMS with your widget loaded for development, use the start script:

```shell
npm start
```


### Production & Publishing

You'll want to take a few steps before publishing a production built package to npm:

1. Customize `package.json` with details for your specific widget, e.g. name, description, author, version, etc.
2. For discoverability, ensure that your package name follows the pattern `netlify-cms-widget-<name>`.
3. Rename the exports in `src/index.js`. For example, if your widget is `netlify-cms-widget-awesome`, you would do:
  ```js
  if (typeof window !== 'undefined') {
    window.RelationCreateControl = RelationCreateControl
    window.RelationCreatePreview = RelationCreatePreview
  }

  export { Control as RelationCreateControl, Preview as RelationCreatePreview }
  ```


### Deploying a live demo

The development (start) task provides a locally served preview of your widget in the CMS editor. This starter also includes a `demo` task for deploying this view live. Here's how to get your demo deployed using Netlify.

1. Assuming your repo is on GitHub, head over to Netlify and [create a site](https://app.netlify.com/start) from your repo.
2. The proper settings will be pre-filled based on what's in the `netlify.toml` file in this repo, so you can just click through to deploy.
3. Add your deployed site url to `README.md`, replacing the placeholder url in the demo link.

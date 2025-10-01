
# finch

  ![finch_icon](https://github.com/user-attachments/assets/bf17cfe1-5df5-4fcd-8c4d-3a99982ce2fe)  
  
A React component library for Bluesky beamlines. 

To view components in your browser and see full documentation check out our [storybook library.](https://blueskyproject.io/finch)


#  Installation
Once you have your own React app setup, install finch in the root project directory with:
```
npm install @blueskyproject/finch
```

Example usage:
```js
//App.tsx
import { Tiled } from '@blueskyproject/finch';
import '@blueskyproject/finch/style.css';

function App() {
  return (
    <Tiled tiledBaseUrl='http://customUrl:port/api/v1' />
  )
}
```

You will only need to import '@blueskyproject/finch/style.css' once, so long as it is imported inside a component that is high enough in the React tree to include all finch components.

**Hint:** To quickly check the props that a component takes on typescript apps, press 'ctrl+space' when clicked inside a component.

## Alternative Installation - Clone This Repo
Instead of installing Finch into your existing React app, you can install this repository directly and get access to preconfigured layouts and pages.
```bash
git clone https://github.com/bluesky/finch.git
cd finch
npm install
npm run dev
```
The app should be running at [http://localhost:5173/](http://localhost:5173/)

# Requirements
Components in this library require network access to the Bluesky Queue Server, Tiled, and Ophyd-Websocket. The components are designed to work out of the box with the default ports for each service. 

Specific paths/ports can be set at runtime with environment variables, or alternatively passed in as props to components that need them.

For detailed backend setup instructions, see our [Backend Setup documentation](https://blueskyproject.io/finch/?path=/docs/documentation-backendsetup--docs).

## Related Projects
- [Queue Server](https://github.com/bluesky/bluesky-queueserver)
- [Tiled](https://github.com/bluesky/tiled)
- [Ophyd WebSocket](https://github.com/bluesky/ophyd-websocket)

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for development and publishing guidelines.

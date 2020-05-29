# editflow

DAG workflow editor.

## Features

### Easy Control

- Move and scale freely
  - Programmatically or in UI
- Multiple selection by holding `Ctrl`
  - Move and resize together

![Easy control](demo/easy-control.gif)

### Lazy Loading

We can support many nodes thanks to lazy loading.  
In the demo below, there are 10K nodes.

![Lazy Loading 10K Nodes](demo/lazy-loading.gif)

### Focus on Selected

It will blur the unselected nodes and let you focus on the selected ones.

![Blur unselected](demo/blur-unselected.gif)

---

## TODO

- Node
   - [ ] Creatable by dragging in
   - [x] Selectable (multiple)
   - [x] Movable
   - [x] Re-sizable
   - [ ] Context Menu
   - [ ] Customizable (Custom Decorations)
- Port
   - [ ] Dynamic Add/Remove/Edit
   - [x] Tooltip
   - [ ] Context Menu
- Edge
   - [x] Creatable by dragging from an unconnected output port
   - [ ] Re-connectable by dragging from a connected input port
   - [ ] Label
   - [ ] Context Menu
   - [ ] Customizable 
     - [ ] Line / Curve
- Canvas
   - [ ] Scalable? (Zoom In, Zoom Out)
      - [ ] Fit width
      - [ ] Fit to view
      - [x] Scale by a factor
   - [ ] Translatable
      - [ ] Move to center
      - [x] Restore to (0, 0)
   - [ ] Alignment
      - [ ] Reference lines
   - [ ] Box Selection
   - [ ] Context Menu
   - [ ] Auto Layout
   - [ ] Thumbnail
   - [x] Lazy loading

## Open-Source Alternatives

- [alibaba/GGEditor](https://github.com/alibaba/GGEditor)
  ![GGEditor](https://camo.githubusercontent.com/8391d76bcc7a7abe8bbe17da3104045a2b109358/68747470733a2f2f696d672e616c6963646e2e636f6d2f7466732f544231636c304c79417a6f4b31526a535a466c58586169345658612d3830302d3430372e676966)
- [murongqimiao/DAG-diagram](https://github.com/murongqimiao/DAG-diagram)
  ![DAG-diagram](https://camo.githubusercontent.com/ca359d0e29db4be5a6aabd28ca4676c8dec86d2a/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031392f392f332f313663663632333733343131363237353f773d34383026683d32373226663d67696626733d31363339313835)
- [TimZaman/dagstudio](https://github.com/TimZaman/dagstudio)
  ![dagstudio](https://github.com/TimZaman/dagstudio/raw/master/misc/20160907_dagstudio_ex.gif)
- [alibaba/butterfly](https://github.com/alibaba/butterfly)
  ![butterfly](https://camo.githubusercontent.com/5dd03a6457f868b6f4ff5c5a0f8c3f7a838aa329/68747470733a2f2f696d672e616c6963646e2e636f6d2f7466732f5442316d77723067627231674b306a535a464458586239795658612d313030302d313030302e706e67)
- [projectstorm/react-diagrams](https://github.com/projectstorm/react-diagrams)
  ![react-diagrams](https://raw.githubusercontent.com/projectstorm/react-diagrams/master/.gitbook/assets/example1.jpg)

---

## Readme from CRA

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

In the project directory, you can run:

#### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

#### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

### Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

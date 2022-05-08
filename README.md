
# JavaScript Business Simulation

A simulation built in JavaScript to allow a user to simulate the flow of a business over a set amount of time. This simulation was created with small-business owners in mind who may not have access to a full analysis or business modelling team. It eradicates the need for separate teams for data analysis, causal analysis or business modelling, allowing the simulation to provide a different mode of analysis that can be conducted by any business owner.

The simulation can run in a console window or with the provided UI.


## User Guides

[User Guide](https://github.com/sburns31/JavaScriptBusinessSimulation/blob/main/user_guide.txt)

[Simulation Flow Diagram](https://github.com/sburns31/JavaScriptBusinessSimulation/blob/main/Code%20Flow%20Diagrams/simulation.js%20flowchart.svg)

[Calculations Flow Diagram](https://github.com/sburns31/JavaScriptBusinessSimulation/blob/main/Code%20Flow%20Diagrams/calculations.js%20flowchart.svg)

## Simulation Features

- Light/dark mode toggle
- Live previews
- Fullscreen mode
- Cross platform

## UI Features

- Light/dark mode toggle
- Live previews
- Fullscreen mode
- Cross platform


## Quick Run

Clone the project

```bash
  git clone https://github.com/sburns31/JavaScriptBusinessSimulation
```

Open the project in VS Code, or similar IDE, and preview in browser.

Click 'Run Simulation' button in UI, open console for log statements.



## Future Progression - UI

The UI of this tool consists of one HTML page built primarily with Bootstrap and CSS. The below list includes further UI changes that could be progressed in the future to improve UI functionality:

- Extra HTML pages added to the navigation bar with further data tables detailing original data with post-simulation data.
- Addition of a Finances page focussing solely on changes within financial data (similar to financial changes table currently in place) with finance-only charts with more detailed financial changes influencing profitability.
- Graphics in representations of data, inspired by game-based simulation to show the scale of a business, and non-financial status such as product availability, number of staff employed etc.
- More interactive space for a user - further interactions with data manipulation, availability to see and change all input data.

## Future Progression - Simulation

The UI of this tool consists of one HTML page built primarily with Bootstrap and CSS. The below list includes further UI changes that could be progressed in the future to improve UI functionality:

- Re-designing input data and functions within simulation files to allow more generalised input data that the simulation can easily adapt to.
- More detailed testing process around probability variables and strength-testing
- Use of an optimiser tool such as [this JavaScript Optimizer tool](https://github.com/optimization-js/optimization-js) to test for the best variable values by maximising or minimising functions.
- Further integration of analysis within simulation, development of JavaScript functions to compare daily results of simulation and output analysis variables.
- Use these analysis functions and optimisation to create an intelligent simulation system with the power to automate an analysis and produce recommended actions for a business owner to take to increase profitability.

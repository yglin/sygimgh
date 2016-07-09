# sygimgh
**Tracking project, visualize dependencies, housekeeping tasks.**

## Features
* Visualize project **tasks as nodes**, task **dependencies as lines** between nodes, thus whole project is an **Directed Acyclic Graph(DAG)**.
* Node(task) has **customized attributes**.
* Can add child node to node, ex: Add a new node B to node A, means Task A depends on Task B, child node **inherits** all customized **attributes** of parent node.
* Can link parent node to exist child node, ex: Link node A to node B, means Task A depends on Task B.
* Recursively tracing nodes(parent to children) and apply some **aggregate/filter functions**(children to parent) upon some atrribute.
* Visualize the above tracing process as **animated-updating** number/bar/(some chart) on the node.
* Housekeep the project by analyzing each node with some customized **Housekeep Rules**



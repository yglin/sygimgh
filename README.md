# sygimgh
**Tracking project, visualize dependencies, housekeeping tasks.**

## User Stories
### Chapter 1
1. I have a project to make a 10 second animation about Will Ferrel got a ball hit in his crotch.
1. Open the home page, see an initial **Root** node, change its title to "Will Ferrel Balls 10s", edit its description, apply an **Animation Manual** to it.
  * A **DAG** component(view + controller)
  * A **DAG Sevice**(model) holding all nodes
  * A single **Node** component(view + editor).
  * A **Manual** component(view + editor).
  * A **Manual** service(model), holding manuals.
1. add a child node to **Root**, titled "Will Ferrel Animation"
  * **DAG Service** - createNode()
  * **DAG Service** - addChild(parent, child)
  * **Node** component(view + editor).
1. add a child node to **Root**, titled "Ball Animation"
  * As above
1. add a child node to **Root**, titled "Background"
  * As above
1. add a child node to **Root**, titled "Will Ferrel Crotch Simulation"
  * As above
1. As "Will Ferrel Crotch Simulation" depends on "Will Ferrel and Ball Anmation", connect node "Will Ferrel Crotch Simulation" to both of them.
  * **DAG Service** - addChild(parent, child)
1. Realize that "Will Ferrel Animation" need additional composition, add a node titled "Will Ferrel Comp" to the Root, and connect from "Will Ferrel Comp" to "Will Ferrel Animation"
  * **DAG Service** - createNode()
  * **DAG Service** - addChild(parent, child)
1. Create a housekeeping rule to find redundant dependency, apply on **Root**, the result suggests removing 2 redundant dependencies of **Root** to "Will Ferrel Animation", **Root** to "Ball Animation".
  * **Housekeeping Component**(view + editor)
  * **Housekeeping Service**(model, CRUD), holding housekeeping rules.
  * **Manual Service** - addHousekeeping(manual, housekeeping).
  * **DAG service** - runHousekeeping(node).


## Features
* Visualize project **tasks as nodes**, task **dependencies as lines** between nodes, thus whole project is an **Directed Acyclic Graph(DAG)**.
* Node(task) has **customized attributes**.
* Can add child node to node, ex: Add a new node B to node A, means Task A depends on Task B, child node **inherits** all customized **attributes** of parent node.
* Can link parent node to exist child node, ex: Link node A to node B, means Task A depends on Task B.
* Recursively tracing nodes(parent to children) and apply some **aggregate/filter functions**(children to parent) upon some atrribute.
* Visualize the above tracing process as **animated-updating** number/bar/(some chart) on the node.
* Housekeep the project by analyzing each node with some customized **Housekeep Rules**

## Definitions
### Node
  * A project, a task, an item, a component, anything that could have dependencies on other nodes.
  * A node can has child nodes, and depends on its child nodes.

### Attribute
  * Defines a node's property.
  * Attribute's value is held in node.
  * Attribute's type and label defined in manual.
  * Can be bound to a reducing method in manual.

### Manual
  * Attached to a node, used to define the node's attributes, reducing methods, and housekeeping rules.
  * If a node doesn't have a manual, the manual of its ascendants which has the shortest path to this node, will apply.

### Reducing Methods
  * A group of functions that can be bind to an attribute and used to reduce the attribute's values of child nodes to that of parent node.

### Housekeeping Rules
  * Customized rules to check if a node is in a "health" status.
  * If not, mark the node as "unhealthy" and report to user.
  * Defined in manual.


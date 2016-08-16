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


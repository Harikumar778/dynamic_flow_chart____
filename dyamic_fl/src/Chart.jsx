import React, { useState, useCallback } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  getOutgoers,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  MiniMap,
  Controls,
  getConnectedEdges,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
// import "./index.css";

export const CareerPathTreeChart = () => {
  const position = { x: 0, y: 0 };
  const initialNodes = [
    {
      id: "1",
      data: { label: "Microsoft" },
      position,
      style: {
        backgroundImage: `url(https://media.geeksforgeeks.org/wp-content/uploads/rk.png)`,
        height: "50px",
        textAlign: "center",
        fontSize: "31px",
      },
    },
    { id: "2", data: { label: "Main Host" }, position },
    { id: "3", data: { label: "Apps" }, position },
    { id: "3a", data: { label: "Core" }, position },
    { id: "4", data: { label: "four" }, position },
    { id: "4a", data: { label: "four" }, position },
    { id: "5", data: { label: "five" }, position },
    { id: "6", data: { label: "six" }, position },
    { id: "7", data: { label: "seven" }, position },
    { id: "8", data: { label: "eight" }, position },
    { id: "9", data: { label: "nine" }, position },
    { id: "9a", data: { label: "ninea" }, position },
    { id: "9b", data: { label: "nineb" }, position },
    { id: "9c", data: { label: "ninec" }, position },
  ];

  const initialEdges = [
    { id: "1->2", source: "1", target: "2" },
    { id: "1->2a", source: "1", target: "4a" },
    { id: "1->3", source: "1", target: "3" },
    { id: "1->3a", source: "1", target: "3a" },
    { id: "2->4", source: "2", target: "4" },
    { id: "2->5", source: "2", target: "5" },
    { id: "2->6", source: "2", target: "6" },
    { id: "3->7", source: "3", target: "7" },
    { id: "3->8", source: "3", target: "8" },
    { id: "8->9", source: "8", target: "9" },
    { id: "5->9", source: "5", target: "9" },
    { id: "5->9a", source: "4", target: "9a" },
    { id: "5->9b", source: "9a", target: "9b" },
    { id: "5->9a", source: "9a", target: "9c" },
  ];

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 172;
  const nodeHeight = 136;

  const getLayoutedElements = (nodes, edges, direction = "TB") => {
    const isHorizontal = direction === "LR";
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition = isHorizontal ? "left" : "top";
      node.sourcePosition = isHorizontal ? "right" : "bottom";

      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      };

      return node;
    });

    return { nodes, edges };
  };

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    initialNodes,
    initialEdges,
    "TB",
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const [hidden, setHidden] = useState(true);

  const hide = (hidden, childEdgeID, childNodeID) => (nodeOrEdge) => {
    if (
      childEdgeID.includes(nodeOrEdge.id) ||
      childNodeID.includes(nodeOrEdge.id)
    )
      nodeOrEdge.hidden = hidden;
    return nodeOrEdge;
  };

  const checkTarget = (edge, id) => {
    let edges = edge.filter((ed) => {
      return ed.target !== id;
    });
    return edges;
  };

  let outgoers = [];
  let connectedEdges = [];
  let stack = [];

  const nodeClick = (some, node) => {
    let currentNodeID = node.id;
    stack.push(node);
    while (stack.length > 0) {
      let lastNOde = stack.pop();
      let childnode = getOutgoers(lastNOde, nodes, edges);
      let childedge = checkTarget(
        getConnectedEdges([lastNOde], edges),
        currentNodeID,
      );
      childnode.map((goer, key) => {
        stack.push(goer);
        outgoers.push(goer);
      });
      childedge.map((edge, key) => {
        connectedEdges.push(edge);
      });
    }

    let childNodeID = outgoers.map((node) => {
      return node.id;
    });
    let childEdgeID = connectedEdges.map((edge) => {
      return edge.id;
    });

    setNodes((node) => node.map(hide(hidden, childEdgeID, childNodeID)));
    setEdges((edge) => edge.map(hide(hidden, childEdgeID, childNodeID)));
    setHidden(!hidden);
  };
  const onNodesChangeNodes = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  const onEdgesChangeEdges = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );

  return (
    <div className="layoutflow" style={{ height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        draggable={true}
        nodesConnectable={false}
        nodesDraggable={true}
        zoomOnScroll={false}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        panOnDrag={false}
        panOnScroll={false}
        onEdgesChange={onEdgesChangeEdges}
        onNodesChange={onNodesChangeNodes}
        onNodeClick={nodeClick}
        attributionPosition="bottom-right"
      >
        <Background variant="dots" gap={12} size={1} />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
};

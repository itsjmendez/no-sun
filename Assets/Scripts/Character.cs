using UnityEngine;

public class Character : MonoBehaviour
{
    void Start()
    {
        // Add orientation indicator arrow
        CreateOrientationArrow();
    }

    /// <summary>
    /// Creates a green arrow to indicate the front direction of the character
    /// </summary>
    private void CreateOrientationArrow()
    {
        // Create a new GameObject for the arrow
        GameObject arrow = new GameObject("OrientationArrow");
        arrow.transform.SetParent(transform);
        
        // Position the arrow in front of the character
        arrow.transform.localPosition = new Vector3(0, 0, 0.5f);
        arrow.transform.localRotation = Quaternion.identity;
        
        // Add a line renderer component to draw the arrow
        LineRenderer lineRenderer = arrow.AddComponent<LineRenderer>();
        lineRenderer.startWidth = 0.05f;
        lineRenderer.endWidth = 0.05f;
        lineRenderer.positionCount = 2;
        
        // Set the arrow points (stem)
        lineRenderer.SetPosition(0, new Vector3(0, 0, 0));
        lineRenderer.SetPosition(1, new Vector3(0, 0, 0.3f));
        
        // Create arrowhead
        GameObject arrowHead = new GameObject("ArrowHead");
        arrowHead.transform.SetParent(arrow.transform);
        arrowHead.transform.localPosition = new Vector3(0, 0, 0.3f);
        
        // Add a second line renderer for the arrowhead
        LineRenderer arrowHeadRenderer = arrowHead.AddComponent<LineRenderer>();
        arrowHeadRenderer.startWidth = 0.05f;
        arrowHeadRenderer.endWidth = 0;
        arrowHeadRenderer.positionCount = 3;
        
        // Set the arrowhead points
        arrowHeadRenderer.SetPosition(0, new Vector3(-0.1f, 0, -0.1f));
        arrowHeadRenderer.SetPosition(1, new Vector3(0, 0, 0.1f));
        arrowHeadRenderer.SetPosition(2, new Vector3(0.1f, 0, -0.1f));
        
        // Set green color for both renderers
        Color greenColor = Color.green;
        lineRenderer.startColor = greenColor;
        lineRenderer.endColor = greenColor;
        arrowHeadRenderer.startColor = greenColor;
        arrowHeadRenderer.endColor = greenColor;
        
        // Set material (optional - you may need to create a material that works with line renderer)
        Material lineMaterial = new Material(Shader.Find("Sprites/Default"));
        lineRenderer.material = lineMaterial;
        arrowHeadRenderer.material = lineMaterial;
    }
} 
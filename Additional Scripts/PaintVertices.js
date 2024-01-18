var radius = 1.0;
var pull = 10.0;
private var unappliedMesh : MeshFilter;

enum FallOff { Gauss, Linear, Needle }
var fallOff = FallOff.Gauss;

static function LinearFalloff (distance : float , inRadius : float) {
	return Mathf.Clamp01(1.0 - distance / inRadius);
}

static function GaussFalloff (distance : float , inRadius : float) {
	return Mathf.Clamp01 (Mathf.Pow (360.0, -Mathf.Pow (distance / inRadius, 2.5) - 0.01));
}

function NeedleFalloff (dist : float, inRadius : float)
{
	return -(dist*dist) / (inRadius * inRadius) + 1.0;
}

function DeformMesh (mesh : Mesh, position : Vector3, power : float, inRadius : float)
{
	var vertices = mesh.vertices;
	var normals = mesh.normals;
	var sqrRadius = inRadius * inRadius;
	
	var averageNormal = Vector3.zero;
	for (var i=0;i<vertices.length;i++)
	{
		var sqrMagnitude = (vertices[i] - position).sqrMagnitude;
		if (sqrMagnitude > sqrRadius)
			continue;

		var distance = Mathf.Sqrt(sqrMagnitude);
		var falloff = LinearFalloff(distance, inRadius);
		averageNormal += falloff * normals[i];
	}
	averageNormal = averageNormal.normalized;
	
	for (i=0;i<vertices.length;i++)
	{
		sqrMagnitude = (vertices[i] - position).sqrMagnitude;
		if (sqrMagnitude > sqrRadius)
			continue;

		distance = Mathf.Sqrt(sqrMagnitude);
		switch (fallOff)
		{
			case FallOff.Gauss:
				falloff = GaussFalloff(distance, inRadius);
				break;
			case FallOff.Needle:
				falloff = NeedleFalloff(distance, inRadius);
				break;
			default:
				falloff = LinearFalloff(distance, inRadius);
				break;
		}
		
		vertices[i] += averageNormal * falloff * power;
	}
	
	mesh.vertices = vertices;
	mesh.RecalculateNormals();
	mesh.RecalculateBounds();
}

function Update () {

	if (!Input.GetMouseButton (0))
	{
		ApplyMeshCollider();
		return;
	}
		
		
	var hit : RaycastHit;
	var ray = Camera.main.ScreenPointToRay(Input.mousePosition);
	if (Physics.Raycast (ray, hit))
	{
		var filter : MeshFilter = hit.collider.GetComponent(MeshFilter);
		if (filter)
		{
			if (filter != unappliedMesh)
			{
				ApplyMeshCollider();
				unappliedMesh = filter;
			}
			
			var relativePoint = filter.transform.InverseTransformPoint(hit.point);
			DeformMesh(filter.mesh, relativePoint, pull * Time.deltaTime, radius);
		}
	}
}

function ApplyMeshCollider () {
	if (unappliedMesh && unappliedMesh.GetComponent(MeshCollider)) {
		unappliedMesh.GetComponent(MeshCollider).mesh = unappliedMesh.mesh;
	}
	unappliedMesh = null;
}
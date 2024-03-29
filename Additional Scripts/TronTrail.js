var height = 2.0;
var time = 2.0;
var alwaysUp = false;
var minDistance = 0.1;

var startColor = Color.white;
var endColor = Color (1, 1, 1, 0);

class TronTrailSection
{
	var point : Vector3;
	var upDir : Vector3;
	var time : float;
}

private var sections = new Array();

function LateUpdate () {
	var position = transform.position;
	var now = Time.time;

	while (sections.length > 0 && now > sections[sections.length - 1].time + time) {
		sections.Pop();
	}

	if (sections.length == 0 || (sections[0].point - position).sqrMagnitude > minDistance * minDistance)
	{
		var section = TronTrailSection ();
		section.point = position;
		if (alwaysUp)
			section.upDir = Vector3.up;
		else
			section.upDir = transform.TransformDirection(Vector3.up);
		section.time = now;
		sections.Unshift(section);
	}
	
	var mesh : Mesh = GetComponent(MeshFilter).mesh;
	mesh.Clear();
	
	if (sections.length < 2)
		return;

	var vertices = new Vector3[sections.length * 2];
	var colors = new Color[sections.length * 2];
	var uv = new Vector2[sections.length * 2];
	
	var previousSection : TronTrailSection = sections[0];
	var currentSection : TronTrailSection = sections[0];

	var localSpaceTransform = transform.worldToLocalMatrix;

	for (var i=0;i<sections.length;i++)
	{
		previousSection = currentSection;
		currentSection = sections[i];
		var u = 0.0;		
		if (i != 0)
			u = Mathf.Clamp01 ((Time.time - currentSection.time) / time);
		
		var upDir = currentSection.upDir;
		
		vertices[i * 2 + 0] = localSpaceTransform.MultiplyPoint(currentSection.point);
		vertices[i * 2 + 1] = localSpaceTransform.MultiplyPoint(currentSection.point + upDir * height);
		
		uv[i * 2 + 0] = Vector2(u, 0);
		uv[i * 2 + 1] = Vector2(u, 1);
		
		var interpolatedColor = Color.Lerp(startColor, endColor, u);
		colors[i * 2 + 0] = interpolatedColor;
		colors[i * 2 + 1] = interpolatedColor;
	}

	var triangles = new int[(sections.length - 1) * 2 * 3];
	for (i=0;i<triangles.length / 6;i++)
	{
		triangles[i * 6 + 0] = i * 2;
		triangles[i * 6 + 1] = i * 2 + 1;
		triangles[i * 6 + 2] = i * 2 + 2;

		triangles[i * 6 + 3] = i * 2 + 2;
		triangles[i * 6 + 4] = i * 2 + 1;
		triangles[i * 6 + 5] = i * 2 + 3;
	}

	mesh.vertices = vertices;
	mesh.colors = colors;
	mesh.uv = uv;
	mesh.triangles = triangles;
}

@script RequireComponent (MeshFilter)

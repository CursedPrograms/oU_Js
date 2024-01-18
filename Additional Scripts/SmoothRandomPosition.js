var speed = 1.0;
var range = Vector3 (1.0, 1.0, 1.0);

private var noise = new Perlin();
private var position : Vector3;

function Start()
{
	position = transform.position;
}

function Update () {
	transform.position = position + Vector3.Scale(SmoothRandom.GetVector3(speed), range);
}
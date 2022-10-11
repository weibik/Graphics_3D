function start() {
	const canvas = document.getElementById("my_canvas");
	//Inicialize the GL contex
	const gl = canvas.getContext("webgl2");
	if (gl === null) {
	alert("Unable to initialize WebGL. Your browser or machine may not support it.");
	return;
	}

	let MAT_PI = 3.14
	console.log("WebGL version: " + gl.getParameter(gl.VERSION));
	console.log("GLSL version: " + gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
	console.log("Vendor: " + gl.getParameter(gl.VENDOR));

	const vs = gl.createShader(gl.VERTEX_SHADER);
	const fs = gl.createShader(gl.FRAGMENT_SHADER);
	const program = gl.createProgram();

	const vsSource = 
			`#version 300 es
			precision highp float;
			in vec3 position;
			in vec3 color;
			uniform mat4 model;
			uniform mat4 view;
			uniform mat4 proj;

			out vec3 Color;
			void main(void)
			{
				Color = color;
			   gl_Position = proj * view * model * vec4(position, 1.0);
			}
			`;

			const fsSource = 
			`#version 300 es
		   precision highp float;
		   in vec3 Color;
		
		   out vec4 frag_color;
		   void main(void)
	   	{
			frag_color = vec4(Color, 1.0);   
	   	}`;

	//compilation vs
	gl.shaderSource(vs, vsSource);		
	gl.compileShader(vs);
	if(!gl.getShaderParameter(vs, gl.COMPILE_STATUS))
	{
		alert(gl.getShaderInfoLog(vs));
	}

	//compilation fs
	gl.shaderSource(fs, fsSource);     
	gl.compileShader(fs);
	if(!gl.getShaderParameter(fs, gl.COMPILE_STATUS))
	{
		alert(gl.getShaderInfoLog(fs));
	}

	if(!gl.getShaderParameter(fs, gl.COMPILE_STATUS))
	{
		alert(gl.getShaderInfoLog(fs));
	}

	gl.attachShader(program,vs);
	gl.attachShader(program,fs);
	gl.linkProgram(program);

	if(!gl.getProgramParameter(program, gl.LINK_STATUS))
	{
		alert(gl.getProgramInfoLog(program));
	}

   gl.useProgram(program);

   const buffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

   var n_draw = 3;
   kostka();
   
	// dane wierzchołkowe 
	const positionAttrib = gl.getAttribLocation(program, "position");
	gl.enableVertexAttribArray(positionAttrib);
	gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, false, 6*4, 0);
	const colorAttrib = gl.getAttribLocation(program, "color");
	gl.enableVertexAttribArray(colorAttrib);
	gl.vertexAttribPointer(colorAttrib, 3, gl.FLOAT, false, 6*4, 3*4);


	//macierz modelu
	const model = mat4.create();
	let kat_obrotu = 45 * MAT_PI / 180 //radiany
	mat4.rotate(model, model, kat_obrotu, [0,0,1])
	//wyslanie shadera
	let uniModel = gl.getUniformLocation(program, 'model');
	gl.uniformMatrix4fv(uniModel, false, model);

	//macierz widoku
	const view = mat4.create();
	mat4.lookAt(view, [0,0,3], [0,0,-1], [0,1,0]);
	//wyslanie shadera
	let uniView = gl.getUniformLocation(program, 'view');
	gl.uniformMatrix4fv(uniView, false, view);

	//macierz projekcji
	const proj = mat4.create();
	mat4.perspective(proj, 60 * MAT_PI /180, gl.canvas.clientWidth/ gl.canvas.clientHeight, 0.1, 100.0);
	//wyslanie shadera
	let uniProj = gl.getUniformLocation(program, 'proj');
	gl.uniformMatrix4fv(uniProj, false, proj);

	let primitive = gl.TRIANGLES;
	gl.enable(gl.DEPTH_TEST);
	window.requestAnimationFrame(draw);

	function draw(){
		ustaw_kamere()
	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.drawArrays(primitive, 0, n_draw);

	window.requestAnimationFrame(draw);
	}

	// Add the event listeners for mousedown, mousemove, and mouseup
	window.addEventListener('mousedown', e => {
	x = e.offsetX;
	y = e.offsetY;
	});

	var pressedKey = {};
	window.onkeyup = function(e) { pressedKey[e.keyCode] = false; }
	window.onkeydown = function(e) { pressedKey[e.keyCode] = true; }

	let cameraPos = glm.vec3(0,0,3);
	let cameraFront = glm.vec3(0,0,-1);
	let cameraUp = glm.vec3(0,1,0);
	let obrot=0.0;

	function ustaw_kamere(){
		let cameraSpeed = 0.02;
		let cameraFront_tmp = glm.vec3(1,1,1);
		
		if (pressedKey["37"]) //left
		{	
			obrot -= cameraSpeed;
			cameraFront.x = Math.sin(obrot);
			cameraFront.z = -Math.cos(obrot)
		}
		if (pressedKey["38"]) //up
		{	
		cameraPos.x+=cameraSpeed * cameraFront.x;
		cameraPos.y+=cameraSpeed * cameraFront.y;
		cameraPos.z+=cameraSpeed * cameraFront.z;
		}
		if (pressedKey["39"]) //right
		{	
			obrot += cameraSpeed;
			cameraFront.x = Math.sin(obrot);
			cameraFront.z = -Math.cos(obrot)
		}
		if (pressedKey["40"]) //down
		{	
		cameraPos.x-=cameraSpeed * cameraFront.x;
		cameraPos.y-=cameraSpeed * cameraFront.y;
		cameraPos.z-=cameraSpeed * cameraFront.z;
		}

		cameraFront_tmp.x = cameraPos.x+cameraFront.x;
		cameraFront_tmp.y = cameraPos.y+cameraFront.y;
		cameraFront_tmp.z = cameraPos.z+cameraFront.z;
		mat4.lookAt(view, cameraPos, cameraFront_tmp, cameraUp);
		gl.uniformMatrix4fv( uniView, false, view);
	}

	window.addEventListener('keydown', function(event) {
		switch (event.keyCode) {
		// e
		case 69:
		{
				if (gl.isEnabled(gl.DEPTH_TEST))
				gl.disable(gl.DEPTH_TEST);
				else
				gl.enable(gl.DEPTH_TEST);
		}
		break;
		// esc
		case 27: {
			var result = confirm("Close Window?");
			if(result)
			{
				console.log("exit");
				window.close()  
			}
		}
		break;
		}
	}, false);
  
	function kostka() {

		let punkty_ = 36;

		var vertices = [
		-0.5, -0.5, -0.5,  0.0, 0.0, 0.0,
		0.5, -0.5, -0.5,  0.0, 0.0, 1.0,
		0.5,  0.5, -0.5,  0.0, 1.0, 1.0,
		0.5,  0.5, -0.5,  0.0, 1.0, 1.0,
		-0.5,  0.5, -0.5,  0.0, 1.0, 0.0,
		-0.5, -0.5, -0.5,  0.0, 0.0, 0.0,

		-0.5, -0.5,  0.5,  0.0, 0.0, 0.0,
		0.5, -0.5,  0.5,  1.0, 0.0, 1.0,
		0.5,  0.5,  0.5,  1.0, 1.0, 1.0,
		0.5,  0.5,  0.5,  1.0, 1.0, 1.0,
		-0.5,  0.5,  0.5,  0.0, 1.0, 0.0,
		-0.5, -0.5,  0.5,  0.0, 0.0, 0.0,

		-0.5,  0.5,  0.5,  1.0, 0.0, 1.0,
		-0.5,  0.5, -0.5,  1.0, 1.0, 1.0,
		-0.5, -0.5, -0.5,  0.0, 1.0, 0.0,
		-0.5, -0.5, -0.5,  0.0, 1.0, 0.0,
		-0.5, -0.5,  0.5,  0.0, 0.0, 0.0,
		-0.5,  0.5,  0.5,  1.0, 0.0, 1.0,

		0.5,  0.5,  0.5,  1.0, 0.0, 1.0,
		0.5,  0.5, -0.5,  1.0, 1.0, 1.0,
		0.5, -0.5, -0.5,  0.0, 1.0, 0.0,
		0.5, -0.5, -0.5,  0.0, 1.0, 0.0,
		0.5, -0.5,  0.5,  0.0, 0.0, 0.0,
		0.5,  0.5,  0.5,  1.0, 0.0, 1.0,

		-0.5, -0.5, -0.5,  0.0, 1.0, 0.0,
		0.5, -0.5, -0.5,  1.0, 1.0, 1.0,
		0.5, -0.5,  0.5,  1.0, 0.0, 1.0,
		0.5, -0.5,  0.5,  1.0, 0.0, 1.0,
		-0.5, -0.5,  0.5,  0.0, 0.0, 0.0,
		-0.5, -0.5, -0.5,  0.0, 1.0, 0.0,

		-0.5,  0.5, -0.5,  0.0, 1.0, 0.0,
		0.5,  0.5, -0.5,  1.0, 1.0, 1.0,
		0.5,  0.5,  0.5,  1.0, 0.0, 1.0,
		0.5,  0.5,  0.5,  1.0, 0.0, 1.0,
		-0.5,  0.5,  0.5,  0.0, 0.0, 0.0,
		-0.5,  0.5, -0.5,  0.0, 1.0, 0.0
		];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

		n_draw=punkty_;
	}
}
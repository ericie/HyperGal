let particles = [];

function setUpParticles() {
    for (let p = 0; p < 100; p++) {
        particles[p] = new Particle();
    }
}

function updateParticles(){

    for (let p = 0; p < particles.length; p++) {
        particles[p].update();
        particles[p].show();
    }
    
}
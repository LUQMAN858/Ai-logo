async function generate(){
  const prompt = document.getElementById('prompt').value.trim();
  const msg = document.getElementById('message');
  const grid = document.getElementById('grid');
  grid.innerHTML = ''; msg.textContent = 'Generating...';
  try{
    const res = await fetch('/api/generate', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ prompt }) });
    const j = await res.json();
    if(!j.success){ msg.textContent = 'Generation failed'; return; }
    msg.textContent = 'Click any logo to download';
    j.variations.forEach(v=>{
      const div = document.createElement('div');
      div.className = 'thumb';
      div.innerHTML = v.svg;
      div.onclick = ()=> window.location.href = '/api/download/' + v.id;
      grid.appendChild(div);
    });
  }catch(err){
    console.error(err);
    msg.textContent = 'Server error — check console.';
  }
}
document.getElementById('gen').addEventListener('click', generate);
document.getElementById('prompt').addEventListener('keydown', (e)=>{ if(e.key==='Enter') generate(); });

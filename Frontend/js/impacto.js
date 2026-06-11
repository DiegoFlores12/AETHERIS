let selectedAmount = 10;

document.querySelectorAll('.amount').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.amount').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    selectedAmount = Number(btn.dataset.amount);
    otherAmount.value = '';
  });
});

async function loadDonationSummary(){
  const data = await api('/donations/summary');
  donationWater.style.height = `${data.percent}%`;
  donationPercent.textContent = `${data.percent}%`;
  donationTotals.textContent = `${money(data.totalMoney)} · ${Number(data.totalPlasticKg).toFixed(2)} kg de plástico / meta ${data.goalKg} kg`;
}

async function donateNow(){
  const custom = Number(otherAmount.value || 0);
  const amount = custom > 0 ? custom : selectedAmount;
  try{
    const res = await api('/donations',{method:'POST',body:JSON.stringify({amount})});
    donationMsg.className='ok';
    donationMsg.textContent = `${res.message}. Aporte: ${money(amount)}.`;
    otherAmount.value='';
    await loadDonationSummary();
  }catch(e){
    donationMsg.className='error';
    donationMsg.textContent=e.message;
  }
}

loadDonationSummary().catch(e=>console.warn(e.message));

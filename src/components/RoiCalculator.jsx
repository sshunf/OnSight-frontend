import React, { useState } from 'react';
import '../css/StatsShowcase.css';

function RoiCalculator() {
  const [form, setForm] = useState({
    members: '',
    equipment: '',
    treadmills: '',
    membershipPrice: '',
  });
  const [results, setResults] = useState(null);

  const COST_PER_EQUIPMENT = 6000;
  const PREVENTATIVE_SAVINGS = 0.15;
  const AVG_LIFESPAN = 10;
  const LIFESPAN_EXTENSION = 2;
  const RETENTION_INCREASE = 0.01;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const calculate = () => {
    const members = parseFloat(form.members) || 0;
    const equipment = parseFloat(form.equipment) || 0;
    const treadmills = parseFloat(form.treadmills) || 0;
    const membershipPrice = parseFloat(form.membershipPrice) || 0;
    const retentionIncrease = RETENTION_INCREASE;

    const savingsMaintenance = equipment * COST_PER_EQUIPMENT * 0.03 * PREVENTATIVE_SAVINGS;
    const savingsRetention = members * retentionIncrease * membershipPrice * 12;
    const savingsLifespan = ((COST_PER_EQUIPMENT / AVG_LIFESPAN) - (COST_PER_EQUIPMENT / (AVG_LIFESPAN + LIFESPAN_EXTENSION))) * equipment;
    const savingsEnergy = treadmills * 28;
    const total = savingsMaintenance + savingsRetention + savingsLifespan + savingsEnergy;

    setResults({
      savingsMaintenance,
      savingsRetention,
      savingsLifespan,
      savingsEnergy,
      total,
    });
  };

  const disabled = !form.members || !form.equipment || !form.treadmills || !form.membershipPrice;

  return (
    <div className="roi-calc-shell">
      <div className="roi-calc-card">
        <p className="eyebrow">ROI calculator</p>
        <h1>Estimate your returns</h1>
        <p className="lede">Enter a few basics. We’ll wire the math once you provide the values. Values are estimated savings, per year.</p>

        <div className="roi-calc-grid">
          <label className="calc-field">
            <span>Number of Members</span>
            <input
              type="number"
              name="members"
              value={form.members}
              onChange={handleChange}
              placeholder="e.g. 1200"
            />
          </label>
          <label className="calc-field">
            <span>Total Number of Equipment</span>
            <input
              type="number"
              name="equipment"
              value={form.equipment}
              onChange={handleChange}
              placeholder="e.g. 250"
            />
          </label>
          <label className="calc-field">
            <span>Number of Treadmills</span>
            <input
              type="number"
              name="treadmills"
              value={form.treadmills}
              onChange={handleChange}
              placeholder="e.g. 55"
            />
          </label>
          <label className="calc-field">
            <span>Monthly Membership Price</span>
            <input
              type="number"
              name="membershipPrice"
              value={form.membershipPrice}
              onChange={handleChange}
              placeholder="e.g. 75"
              step="0.01"
            />
          </label>
        </div>

        <div className="roi-calc-actions">
          <button type="button" className="primary" onClick={calculate} disabled={disabled}>
            Calculate
          </button>
        </div>

        {results && (
          <div className="roi-results receipt">
            <div className="result-card receipt-row">
              <div>
                <p className="card-title">Savings on Maintenance Cost</p>
                <p className="card-helper">15% Savings from Preventative Maintenance</p>
              </div>
              <p className="result-value">${results.savingsMaintenance.toFixed(2)}</p>
            </div>
            <div className="result-card receipt-row">
              <div>
                <p className="card-title">Savings on Retention</p>
                <p className="card-helper">~1% Decrease in Churn</p>
              </div>
              <p className="result-value">${results.savingsRetention.toFixed(2)}</p>
            </div>
            <div className="result-card receipt-row">
              <div>
                <p className="card-title">Savings on Equipment Lifespan</p>
                <p className="card-helper">Delta Annual Depreciation × Equipment</p>
              </div>
              <p className="result-value">${results.savingsLifespan.toFixed(2)}</p>
            </div>
            <div className="result-card receipt-row">
              <div>
                <p className="card-title">Savings on Energy</p>
                <p className="card-helper">Reduced Power Draw</p>
              </div>
              <p className="result-value">${results.savingsEnergy.toFixed(2)}</p>
            </div>
            <div className="result-card receipt-total">
              <p className="card-title">Total Savings</p>
              <p className="result-value">${results.total.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoiCalculator;

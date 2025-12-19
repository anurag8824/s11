import React, { useState } from "react";
import "./ClientLedger.css"; // Import the CSS file

const ClientLedger: React.FC = () => {
  const [showTable, setShowTable] = useState<boolean>(true);

  const handleSettlement = (agent: string) => {
    alert(`Settlement process initiated for ${agent}`);
  };

  const lenaHaiData = [
    { agent: "A85577 (Infa34)", amount: 1170050, settled: 1029300, final: 140750 },
    { agent: "A87039 (Infayou122)", amount: 1022250, settled: 198000, final: 824250 },
    { agent: "A87043 (Sejal12)", amount: 438050, settled: 407000, final: 31050 },
    { agent: "A87047 (Lokesh1226)", amount: 457350, settled: 1179350, final: 722000 },
    { agent: "A96236 (Aurag132)", amount: 2745431.38, settled: 1555800, final: 1189931.38 },
    { agent: "A103815 (Test142)", amount: 200000, settled: 0, final: 200000 },
    { agent: "A104219 (Test344)", amount: 2915, settled: 0, final: 2915 },
  ];

  const denaHaiData = [
    { agent: "C85579 (Demo1234)", amount: 1377000, settled: 1382000, final: 5000 },
    { agent: "C85604 (Test1234)", amount: 82285, settled: 24740, final: 57545 },
  ];

  return (
    <div className="ledger-container">
      <h2 className="ledger-title">All Client Ledger</h2>

      {showTable && (
        <>
          {/* LENA HAI TABLE */}
          <div className="table-section">
            <h3>PAYMENT RECEIVING FROM (LENA HAI)</h3>
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>AGENT</th>
                  <th>AMOUNT</th>
                  <th>SETTLED</th>
                  <th className="bg-final">FINAL</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {lenaHaiData.map((row, index) => (
                  <tr key={index}>
                    <td className="agent">{row.agent}</td>
                    <td className="final-amount">{row.amount.toLocaleString()}</td>
                    <td className="final-amount">{row.settled.toLocaleString()}</td>
                    <td className="final-amount ">{row.final.toLocaleString()}</td>
                    <td>
                      <button
                        className="settlement-btn"
                        onClick={() => handleSettlement(row.agent)}
                      >
                        Settlement
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* DENA HAI TABLE */}
          <div className="table-section">
            <h3>PAYMENT PAID TO (DENA HAI)</h3>
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>AGENT</th>
                  <th>AMOUNT</th>
                  <th>SETTLED</th>
                  <th>FINAL</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {denaHaiData.map((row, index) => (
                  <tr key={index}>
                    <td className="agent">{row.agent}</td>
                    <td className="final-amount">{row.amount.toLocaleString()}</td>
                    <td className="final-amount">{row.settled.toLocaleString()}</td>
                    <td className="final-amount">{row.final.toLocaleString()}</td>
                    <td>
                      <button
                        className="settlement-btn"
                        onClick={() => handleSettlement(row.agent)}
                      >
                        Settlement
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ClientLedger;

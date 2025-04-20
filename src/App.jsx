import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { getDatabase, ref, set, onValue } from "firebase/database";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCiUYxb2931zDsYW57ujaoQ_2SUoFoZSn8",
  authDomain: "project-progress-a5543.firebaseapp.com",
  projectId: "project-progress-a5543",
  storageBucket: "project-progress-a5543.firebasestorage.app",
  messagingSenderId: "946944548390",
  appId: "1:946944548390:web:c250d15f965decace250e7",
  measurementId: "G-J5NGPSG13G"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default function ProgressTracker() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);  // 新增 loading 狀態

  useEffect(() => {
    const unitsRef = ref(db, 'units');
    onValue(unitsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUnits(Object.values(data));
      }
      setLoading(false);  // 數據加載完成，隱藏 loading
    }, (error) => {
      console.error("Error loading data from Firebase:", error);
      alert("Failed to load data!");
      setLoading(false);  // 出錯時也隱藏 loading
    });
  }, []);

  const handleCheckboxChange = (index, task) => {
    const updatedUnits = [...units];
    updatedUnits[index].tasks[task] = !updatedUnits[index].tasks[task];
    const allDone = Object.values(updatedUnits[index].tasks).every(v => v);
    updatedUnits[index].show = !allDone;
    setUnits(updatedUnits);
    saveToFirebase(updatedUnits);
  };

  const saveToFirebase = (data) => {
    const unitsRef = ref(db, 'units');
    const updateObj = {};
    data.forEach((u, i) => {
      updateObj[i] = u;
    });
    set(unitsRef, updateObj);
  };

  if (loading) {
    return <div>Loading...</div>;  // 顯示 Loading 狀態
  }

  return (
    <div className="p-4 space-y-4">
      {units.map((unit, index) => (
        unit.show && (
          <div key={index} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem' }}>
            <input
              defaultValue={unit.name}
              onChange={(e) => {
                const updated = [...units];
                updated[index].name = e.target.value;
                setUnits(updated);
                saveToFirebase(updated);
              }}
              style={{ fontWeight: 'bold', width: '30%' }}
            />
            <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
              <div>
                <label>IN 日期</label><br />
                <input
                  type="date"
                  value={format(new Date(unit.inDate), 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    const updated = [...units];
                    updated[index].inDate = date;
                    updated[index].deadline = addDays(date, 90);
                    setUnits(updated);
                    saveToFirebase(updated);
                  }}
                />
              </div>
              <div>
                <label>DEADLINE</label><br />
                <input value={format(new Date(unit.deadline), 'yyyy-MM-dd')} readOnly />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
              {Object.keys(unit.tasks).map((taskKey, tIndex) => (
                <label key={tIndex}>
                  <input
                    type="checkbox"
                    checked={unit.tasks[taskKey]}
                    onChange={() => handleCheckboxChange(index, taskKey)}
                  />
                  {taskKey}
                </label>
              ))}
            </div>
            <textarea
              placeholder="備註..."
              value={unit.remark}
              onChange={(e) => {
                const updated = [...units];
                updated[index].remark = e.target.value;
                setUnits(updated);
                saveToFirebase(updated);
              }}
              style={{ width: '100%', minHeight: '80px', marginTop: '1rem' }}
            />
          </div>
        )
      ))}
    </div>
  );
}

import { useState } from "react";
import "./App.css";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors,
} from "chart.js";
import FloatingWords from "./components/FloatingWords.jsx";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TRAIT_COLORS = {
  "I-Trait": "bg-success",
  dict_Trait: "bg-warning text-dark",
};

function App() {
  const [pmid, setPmid] = useState("");
  const [annotations, setAnnotations] = useState([]);
  const [abstract, setAbstract] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFetchAnnotations = async () => {
    if (!pmid) return;
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/ner/${pmid}`);
      if (!response.ok) throw new Error("Failed to fetch annotations");

      const data = await response.json();
      setAbstract(data.Abstract);
      setTitle(data.Title);
      setAnnotations([...data.Abstract_Traits, ...data.Title_Traits]);
    } catch (error) {
      console.error(error);
      setAnnotations([]);
      setAbstract("");
      setTitle("");
    } finally {
      setLoading(false);
    }
  };

  const renderAnnotatedText = (text) => {
    if (!annotations.length) return <span>{text}</span>;

    const elements = [];
    let lastIndex = 0;

    const relevantAnnotations = annotations
      .filter((ann) => text.includes(ann.Word))
      .sort((a, b) => text.indexOf(a.Word) - text.indexOf(b.Word));

    relevantAnnotations.forEach(({ Word, Trait_Type }, idx) => {
      const start = text.indexOf(Word, lastIndex);
      if (start === -1) return;
      const end = start + Word.length;
      const colorClass = TRAIT_COLORS[Trait_Type] || "bg-secondary";

      if (start > lastIndex) {
        elements.push(
          <span key={`plain-${idx}`}>{text.slice(lastIndex, start)}</span>
        );
      }

      elements.push(
        <span key={`ent-${idx}`} className={`badge ${colorClass} mx-1`}>
          {text.slice(start, end)} ({Trait_Type})
        </span>
      );

      lastIndex = end;
    });

    if (lastIndex < text.length) {
      elements.push(<span key="plain-end">{text.slice(lastIndex)}</span>);
    }

    return elements;
  };

  // Helper functions for charts
  const getEntityFrequencies = (anns) => {
    const counts = {};
    anns.forEach(({ Trait_Type }) => {
      counts[Trait_Type] = (counts[Trait_Type] || 0) + 1;
    });
    return counts;
  };

  const getTitleVsAbstractCounts = (titleAnns, abstractAnns) => {
    const counts = {};
    [...titleAnns, ...abstractAnns].forEach(({ Trait_Type, Word }) => {
      if (!counts[Trait_Type]) counts[Trait_Type] = { title: 0, abstract: 0 };
      if (titleAnns.find((a) => a.Word === Word)) counts[Trait_Type].title += 1;
      if (abstractAnns.find((a) => a.Word === Word))
        counts[Trait_Type].abstract += 1;
    });
    return counts;
  };

  const titleAnnotations = annotations.filter((a) => title.includes(a.Word));
  const abstractAnnotations = annotations.filter((a) =>
    abstract.includes(a.Word)
  );

  // Collect words from annotations
  // const floatingWords = annotations.map((a) => a.Word);

  return (
    <div className="container my-5">
      {/* <FloatingWords words={floatingWords} /> */}
      <div className="card shadow-lg mx-auto" style={{ maxWidth: "900px" }}>
        <div className="card-body p-4">
          <h1 className="card-title text-center mb-4">QTL Annotation Viewer</h1>

          <div className="input-group mb-3">
            <input
              type="number"
              className="form-control"
              placeholder="Enter PMID..."
              value={pmid}
              onChange={(e) => setPmid(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={handleFetchAnnotations}
              disabled={loading}
            >
              {loading ? "Fetching..." : "Fetch"}
            </button>
          </div>

          <div className="d-flex justify-content-center gap-3 my-3">
            <span className="badge bg-success">I-Trait</span>
            <span className="badge bg-warning text-dark">dict_Trait</span>
          </div>

          {abstract && (
            <div className="mb-4">
              <h5 className="text-secondary">Abstract</h5>
              <div
                className="border rounded p-3"
                style={{
                  maxHeight: "250px",
                  overflowY: "auto",
                  textAlign: "left",
                }}
              >
                {renderAnnotatedText(abstract)}
              </div>
            </div>
          )}

          {title && (
            <div className="mb-4">
              <h5 className="text-secondary">Title</h5>
              <div
                className="border rounded p-3"
                style={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  textAlign: "left",
                }}
              >
                {renderAnnotatedText(title)}
              </div>
            </div>
          )}

          {annotations.length > 0 && (
            <div className="mt-4">
              <h5 className="text-secondary">Entity Frequency</h5>
              <div className="border rounded p-3 mb-4">
                <Bar
                  data={{
                    labels: Object.keys(getEntityFrequencies(annotations)),
                    datasets: [
                      {
                        label: "Count",
                        data: Object.values(getEntityFrequencies(annotations)),
                        backgroundColor: ["#ffc107", "#198754"], // I-Trait / dict_Trait
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>

              <h5 className="text-secondary">Title vs Abstract Comparison</h5>
              <div className="border rounded p-3">
                <Bar
                  data={{
                    labels: Object.keys(
                      getTitleVsAbstractCounts(
                        titleAnnotations,
                        abstractAnnotations
                      )
                    ),
                    datasets: [
                      {
                        label: "Title",
                        data: Object.values(
                          getTitleVsAbstractCounts(
                            titleAnnotations,
                            abstractAnnotations
                          )
                        ).map((v) => v.title),
                        backgroundColor: "#0d6efd",
                      },
                      {
                        label: "Abstract",
                        data: Object.values(
                          getTitleVsAbstractCounts(
                            titleAnnotations,
                            abstractAnnotations
                          )
                        ).map((v) => v.abstract),
                        backgroundColor: "#6c757d",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { title: { display: false } },
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

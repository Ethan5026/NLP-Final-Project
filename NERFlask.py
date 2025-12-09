import re
from flask import Flask, jsonify

from CuPUL.src.NERClassifier import NERClassifier
from QTLDataManager import QTLDataManager


app = Flask(__name__)

qtl_manager = QTLDataManager()

from types import SimpleNamespace

args = SimpleNamespace(
    seed=42,
    dataset_name="QTL",
    temp_dir="CuPUL/data/QTL/temp",
    output_dir="CuPUL/data/QTL/output",
    max_seq_length=300,
    num_models=5,
    do_train=False,
    do_eval=False,
    m=20,
    drop_other=0.5,
    drop_entity=0.1,
    pretrained_model="roberta-base",
    train_batch_size=32,
    eval_batch_size=32,
    train_lr=5e-7,
    train_epochs=1,
    curriculum_train_sub_epochs=1,
    curriculum_train_lr=2e-7,
    curriculum_train_epochs=5,
    self_train_lr=5e-7,
    self_train_epochs=5,
    weight_decay=0.01,
    warmup_proportion=0.1,
    self_train_update_interval=100,
    entity_threshold=0.8,
    ratio=0.1,
    priors=[0.0382405850627, 0.00994870190668],
    train_on="train",
    eval_on="test",
    tag_scheme="io",
    noise_train_update_interval=200,
    student1_lr=1e-5,
    student2_lr=1e-5,
)
ner_classifier = NERClassifier(args)
ner_classifier.load_model("./CuPUL/data/QTL/output")

def get_ner(text):
    #create a txt file of the seperated text in CuPUL/data/tester.txt
    segmented_text = re.findall(r"[A-Za-z0-9']+|[^\w\s]", text)
    with open("CuPUL/data/QTL/flask_predict.txt", "w") as fp:
        fp.write("\n".join([ segment + " O" for segment in segmented_text]) + "\n\n")

    y_preds,pred_probs = ner_classifier.predict_data("flask_predict")

    #iterate through each entity in the txt, assigning the y_pred with the term
    traits = []
    for y_pred, segment in zip(y_preds[0], segmented_text):
        if y_pred == "O":
            continue
        traits.append({"Trait_Type":y_pred, "Word": segment.lower()})
    return traits

@app.route('/ner/<int:pmid>', methods=['GET'])
def get_tasks(pmid):
    if pmid is None:
        return jsonify({'error': 'PMID is required'}), 400
    try:
        results = qtl_manager.fetch_data(pmid)
    except Exception as e:
        return jsonify({'error': f'Error fetching file, {e}'}), 500

    try:
        abstract_ner = get_ner(results["Abstract"])
    except Exception as e:
        return jsonify({'error': f'Error predicting abstract NER, {e}'}), 500
    try:
        title_ner = get_ner(results["Title"])
    except Exception as e:
        return jsonify({'error': f'Error predicting title NER, {e}'}), 500

    results["Abstract_Traits"].extend(abstract_ner)
    results["Title_Traits"].extend(title_ner)
    return jsonify(results),  200

if __name__ == '__main__':
    app.run(debug=True)
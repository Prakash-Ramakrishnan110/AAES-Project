from sentence_transformers import SentenceTransformer, util
import torch

# Load the model (all-MiniLM-L6-v2)
model = SentenceTransformer('all-MiniLM-L6-v2')

def check_similarity(current_answer, previous_answers):
    """
    Check semantic similarity between current answer and a list of previous answers.
    """
    if not previous_answers:
        return 0, "verified"

    # Compute embeddings
    current_embedding = model.encode(current_answer, convert_to_tensor=True)
    previous_embeddings = model.encode(previous_answers, convert_to_tensor=True)

    # Compute cosine similarity
    cosine_scores = util.cos_sim(current_embedding, previous_embeddings)
    
    # Get the highest similarity score
    max_score = float(torch.max(cosine_scores))
    similarity_percentage = float(f"{max_score * 100:.2f}")

    # Determine status
    if similarity_percentage < 70:
        status = "verified"
    elif similarity_percentage < 85:
        status = "warning"
    else:
        status = "flagged"

    return similarity_percentage, status

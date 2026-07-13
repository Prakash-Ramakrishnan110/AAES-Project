from sentence_transformers import SentenceTransformer, util
import torch

# Load the model (all-MiniLM-L6-v2)
model = SentenceTransformer('all-MiniLM-L6-v2')

def check_similarity(current_answer, previous_answers):
    """
    Check semantic similarity between current answer and a list of previous answers.
    """
    if not previous_answers:
        return 0.0, "Accepted"

    # Compute embeddings
    current_embedding = model.encode(current_answer, convert_to_tensor=True)
    previous_embeddings = model.encode(previous_answers, convert_to_tensor=True)

    # Compute cosine similarity
    cosine_scores = util.cos_sim(current_embedding, previous_embeddings)
    
    # Get the highest similarity score
    max_score = float(torch.max(cosine_scores))
    
    # Determine status based on defined rules
    if max_score < 0.70:
        status = "Accept"
    elif max_score < 0.85:
        status = "Warning"
    else:
        status = "Possible Copy"

    return max_score, status

def get_benchmarking_score(current_answer, top_peer_answers):
    """
    Compare student answer against top-performing peer answers.
    Returns a score (0.0 to 1.0) indicating how close the student is to 'top' performance.
    """
    if not top_peer_answers:
        return 0.0
    
    current_embedding = model.encode(current_answer, convert_to_tensor=True)
    peer_embeddings = model.encode(top_peer_answers, convert_to_tensor=True)
    
    cosine_scores = util.cos_sim(current_embedding, peer_embeddings)
    # Average similarity to top answers gives a 'benchmarking' feel
    avg_score = float(torch.mean(cosine_scores))
    
    return avg_score

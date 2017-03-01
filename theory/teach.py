

class Learner:
    def __init__(self, p, alpha=0.05):
        self.p = p
        self.w = [0] * p
        self.alpha = alpha

    def teach(self, example):
        for i in range(len(example)):
            j = example[i]
            self.w[j] = self.alpha * (1 - self.w[j]) + self.w[j]

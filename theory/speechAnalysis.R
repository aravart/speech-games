library(data.table)
library(plyr)

df = read.csv('speech.tsv', sep='\t')[1:5]
colnames(df) <- c("Name", "Utterance", "Recognition", "Correct", "Verb")
df$Utterance <- as.character(df$Utterance)
df$Recognition <- as.character(df$Recognition)
df$Id <- seq.int(nrow(df))
df$Verb <- as.factor(df$Verb)
df$Verb <- mapvalues(df$Verb, from = c("C","D","H","G","R"), to = c("Connect", "Delete","Change","Get","Run"))

dfl = list()
for(i in 1:nrow(df)) {
    words = unlist(strsplit(df[i,]$Utterance, " "))
    for(j in 1:length(words)) {
        dfl <- rbind(dfl, c(as.character(df[i,]$Id), words[j], df[i,]$Recognition, as.character(df[i,]$Name)))
    }
}
dfl = as.data.frame(dfl)
colnames(dfl) <- c("Id", "Input", "Output", "Speaker")
dfl$Id = as.numeric(dfl$Id)
dfl$Output = as.character(dfl$Output)
dfl$Has <- apply(dfl, 1, function(x) x$Input %in% strsplit(x$Output, " ")[[1]])
dfl$Input <- as.factor(unlist(dfl$Input))

tm <- aggregate(dfl$Has, by=list(dfl$Input), FUN=mean)
tt <- table(dfl$Input)
colnames(tm) <- c("Word", "Accuracy")
tm$Count = tt
tm <- tm[with(tm, order(-Count)),]

verb <- aggregate(df$Correct, by=list(df$Verb), FUN=mean)
colnames(verb) <- c("Verb", "Mean Accuracy")

speaker <- aggregate(df$Correct, by=list(df$Name), FUN=mean)
colnames(speaker) <- c("Speaker", "Mean Accuracy")

tm[1:20,]
verb
speaker

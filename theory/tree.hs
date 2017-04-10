import Debug.Trace (trace)
import Unsafe.Coerce 

import Control.Arrow (first)
import Control.Monad
import Control.Monad.State
import System.Random
import Data.List (group, inits, intersperse, sort, tails, nub, union, intersect, (\\))
import Data.Map (fromList, Map, findWithDefault, keys, (!))

type Block = Int
type Prog = [Block]

data Tree a = Tree a [Tree a] deriving (Eq, Ord, Show)

dbg :: (Show a) => a -> a
dbg = trace =<< show

-- Methods to extract values from the Tree data type
val (Tree a _) = a
children (Tree _ as) = as

s :: Block -> Prog -> [Prog]
-- A successor function which inserts a block into a program returning a set of programs
-- Block is the wrong parameter here as we are really going up to k as in [0..(k-1)]
s k xs = concat $ zipWith (\l r -> map (\k -> l ++ k : r) [0..(k-1)]) (inits xs) (tails xs)

constructTo :: Int -> Prog -> Tree Prog
-- Recursively construct a tree of programs starting from a single node up to i layers deep
constructTo 0 node = Tree node []
constructTo i node = Tree node (map (constructTo (i-1)) (s k node))

pp :: Show a => Tree a -> IO ()
-- Print each node and then its children so that you get a depth-first traversal of the tree as you print
pp = pp' 0 
    where pp' depth (Tree val children) = do
            putStrLn $ replicate (depth * 2) ' ' ++ (show val)
            forM_ children (pp' (depth+1))

p = 0.5
k = 2

compute :: Prog -> Tree Prog -> Tree (Double, Prog)
-- Given a goal and a tree, replace it with a tree that has a tuple of the probabilities of reaching that goal from that node
-- Work backwards setting the probability to 1 at the goal node, otherwise make the appropriate computation from the probabilities of the children
compute y (Tree x xs) = Tree (if x == y then 1.0 else 1.0 - (product (map ((1-) . (p*)) newValues)), x) newChildren
  where newChildren = map (compute y) xs
        newValues = map (fst . val) newChildren

-- pp $ constructTo 2 []
-- pp $ compute [0,0] (constructTo 2 [])

analytic :: Prog -> Tree (Double, Prog)
-- A wrapper to take any program, construct the tree up to its length, and compute the reachability probability
analytic x = compute x $ constructTo (length x) []

-- λ> val $ analytic [0]
-- (0.5,[])
-- λ> val $ analytic [0,0]
-- (0.375,[])
-- λ> val $ analytic [0,0,0]
-- (0.341796875,[])
-- λ> val $ analytic [0,0,0,0]
-- (0.3347068018047139,[])
-- λ> val $ analytic [0,0,0,0,0]
-- (0.33370127081857737,[])
-- λ> val $ analytic [0,0,0,0,0,0]
-- (0.3336152791176372,[])
-- λ> val $ analytic [0,0,0,0,0,0,0]
-- (0.3336110142408477,[])

-- λ> val $ analytic [0]
-- (0.5,[])
-- λ> val $ analytic [0,1]
-- (0.4375,[])
-- λ> val $ analytic [0,1,0]
-- (0.48577880859375,[])
-- λ> val $ analytic [0,1,0,1]
-- (0.5898545616385877,[])
-- λ> val $ analytic [0,1,0,1,0]
-- (0.6706450689130079,[])
-- λ> val $ analytic [0,1,0,1,0,1]
-- (0.7068532939794941,[])
-- λ> val $ analytic [0,1,0,1,0,1,0]
-- (0.7143948603506558,[])

bfs :: Ord a => a -> a -> (a -> [a]) -> Bool
-- A search that returns a boolean if the node was found, taking a source, target, and successor function using a queue structure
-- We do not check for visited nodes, which could be an issue on a graph but is not an issue on a tree where no node is visited twice
bfs s t successors = bfs' t successors [s]
 where bfs' _ _ [] = False
       bfs' t successors (x:xs)
           | x == t    = True
           | otherwise = bfs' t successors (xs ++ successors x)

type R = State StdGen

runR = flip runState . mkStdGen
evalR = flip evalState . mkStdGen

randomSt :: Random a => R a  
-- Get the state, get another random value, save the state, return the random value
randomSt = do
  g <- get
  let (a,g') = random g
  put g'
  return a

-- rsuccessors :: (a -> [a]) -> a -> R [a]
rsuccessors :: (a -> [a]) -> a -> IO [a]
-- Take a successor function and an item and then stochastically drop edges
-- filterM takes a simple list and a monadic function returning a boolean
-- Our monadic function that returns a boolean makes no use of the item itself and so we can get away with \_
-- rsuccessors f a = filterM (const $ (randomSt :: R Double) >>= (return . ( < p))) (f a)
rsuccessors f a = flip filterM (f a) $ \_ -> do
   -- c <- randomSt :: R Double
   c <- randomIO
   return (c < p)

-- Filters items from a list stochastically: needed later on when the list is already computed and we just need to knock them out
-- Differs from rsuccessors in that it does not apply a function to the list
rchoose = filterM (const (randomIO >>= return . (<p)))

-- rbfs :: (Ord a) => a -> a -> (a -> [a]) -> R Bool
rbfs :: (Ord a) => a -> a -> (a -> [a]) -> IO Bool
-- Same bfs as above only we return in the monad
-- Since the bfs' function returns in the monad, we can use tail recursion with no problem
rbfs s t successors = bfs' t successors [s]
    where bfs' _ _ [] = return False
          bfs' t successors (x:xs)
              | x == t    = return True
              | otherwise = do
                              children <- rsuccessors successors x
                              bfs' t successors (xs ++ children)

-- Take a program x, construct the graph, do rbfs on it
trial x =  rbfs (constructTo (length x) []) (Tree x []) children

-- replicateM 10 (trial [0,1]) >>= return . length . filter id

-- Take some number of trials, a program x, do trials trials, return the mean
estimate trials x = replicateM trials (trial x) >>= return . ((/ (fromIntegral trials)) . fromIntegral) . length . filter id

-- trialIO x = do
--   s <- getStdGen
--   return $ evalState (trial x) s

-- getStdGen >>= return . evalState (rsuccessors inits [0,1])

-- bug is that because we are diong evalState, the getStdGen isn't being updated with the randomness
-- how do you make this work with either IO a or the state monad?

-- construct the graph as an adjacency structure (so you can construct nodes and edges separately)... and you can pass through and knock out each edge randomly over the whole structure
type Graph = Map Prog [Prog]

-- class Successor f where
--     successor :: f -> a -> [a]
-- instance Successor (Map a) where
--     successor = undefined

nextLayer :: [Prog] -> [Prog]
-- Given a layer, give all the successors, but then remove duplicated
nextLayer = nub . concat .  map (s k)

vertices :: Int -> [Prog]
-- Construct all vertices of blocks up to k by iteratively constructing the layers, taking the first k, and flattening
vertices k = concat $ take k $ iterate nextLayer [[]]

graph :: Int -> Map Prog [Prog]
-- Construct a graph by first constructing vertices, adding all its deduplicated successors in a list, and turning this into a map from vertex to edges
graph k = fromList $ map (ap (,) (nub . s k)) $ vertices k

-- I can do the plain old rbfs but there's no visited check and I'm concerned about multiple trials, so one idea is to build the random graph and run ordinary bfs, but another is to add a visited check to bfs

rgraph :: Int -> IO (Map Prog [Prog])
-- A graph with some edges knocked out (mapM works on the values of a map)
rgraph k = mapM rchoose (graph k)

trial' :: [Block] -> IO Bool
-- Construct a random graph up to x, search it using a pure bfs using a successor function that fails gracefully on key errors
trial' x =  do
  g <- rgraph (length x)
  return $ bfs [] x (flip (findWithDefault []) g)

-- let l = fromList [([],[[0],[1]]),([0],[[0,0],[0,1]]),([1],[])]
-- bfs [] [0,1] (flip (findWithDefault []) l)

estimate' :: Fractional b => Int -> [Block] -> IO b
-- Take multiple trials of trial' and count the true ones (length . filter id)
estimate' trials x = replicateM trials (trial' x) >>= return . ((/ (fromIntegral trials)) . fromIntegral) . length . filter id

-- λ> val $ analytic [0]
-- (0.5,[])
-- λ> val $ analytic [0,1]
-- (0.4375,[])
-- λ> val $ analytic [0,1,0]
-- (0.48577880859375,[])
-- λ> val $ analytic [0,1,0,1]
-- (0.5898545616385877,[])
-- λ> val $ analytic [0,1,0,1,0]
-- (0.6706450689130079,[])
-- λ> val $ analytic [0,1,0,1,0,1]
-- (0.7068532939794941,[])
-- λ> val $ analytic [0,1,0,1,0,1,0]
-- (0.7143948603506558,[])

-- λ> estimate' 1000 [0]
-- 0.496
-- λ> estimate' 1000 [0,1]
-- 0.453
-- λ> estimate' 1000 [0,1,0]
-- 0.413
-- λ> estimate' 1000 [0,1,0,1]
-- 0.471
-- λ> estimate' 1000 [0,1,0,1,0]
-- 0.551
-- λ> estimate' 1000 [0,1,0,1,0,1]
-- 0.611
-- λ> estimate' 1000 [0,1,0,1,0,1,0]
-- 0.633

-- You may want to plot the differences by drawing an average leaf of a certain size and running both estimators a bunch of times

-- Okay, but here's a question:
-- If we just use the probability rules for the graph, do we get the same values as the tree?
-- In other words, can I reproduce val $ analytic [0,1,0]?

compute' :: Prog -> Prog -> (Prog -> [Prog]) -> Double
compute' src target graph
    | src == target = 1.0
    | otherwise = 1.0 - product (map ((1-) . (p*)) (map (\s -> compute' s target graph) (graph src)))
-- compute y (Tree x xs) = Tree (if x == y then 1.0 else 1.0 - (product (map ((1-) . (p*)) newValues)), x) newChildren
--   where newChildren = map (compute y) xs
--         newValues = map (fst . val) newChildren

analytic' x = compute' [] x (\s -> findWithDefault [] s (graph (length x)))

-- λ> analytic' [0]
-- 0.5
-- λ> analytic' [0,1]
-- 0.4375
-- λ> analytic' [0,1,0]
-- 0.444580078125
-- λ> analytic' [0,1,0,1]
-- 0.5087845331281642
-- λ> analytic' [0,1,0,1,0]
-- 0.5837267759149989

-- Now let's think about factoring paths symbolically

data Factor = Event Int | Conj [Factor] | Disj [Factor]
            deriving Eq

disj :: Factor -> Factor -> Factor
disj (Conj []) (Conj ys) = Conj ys
disj (Conj xs) (Conj []) = Conj xs
disj (Conj [x]) (Conj [y])
  | x == y    = x
  | otherwise = Disj [x,y]
disj (Conj xs) (Conj ys) = Conj (disj (Conj (xs \\ ys)) (Conj (ys \\ xs)) : (intersect xs ys))
-- disj (Event x) (Event y)
--   | x == y    = Event x
--   | otherwise = Disj [Event x, Event y]
-- disj e@(Event _) (Disj xs) = if elem e xs then Disj xs else Disj (e : xs)
-- disj (Disj xs) e@(Event _) = if elem e xs then Disj xs else Disj (e : xs)

mk = Conj . map Event

instance Show Factor where
    show (Event i) = show i
    show (Conj xs) = "(" ++ (concat $ intersperse " && " $ map show xs) ++ ")"
    show (Disj xs) = "(" ++ (concat $ intersperse " || " $ map show xs) ++ ")"

-- λ> disj (mk [1,2,3,4]) (mk [1,5,6,4])
-- (((2 && 3) || (5 && 6)) && 1 && 4)

-- λ> disj (disj (mk [1,2,3,4]) (mk [1,5,6,4])) (mk [1,7])
-- (((((2 && 3) || (5 && 6)) && 4) || (7)) && 1)

-- disj (disj (mk [1,2,3,4]) (mk [1,5,6,4])) (mk [1,2,3,7,8])
-- Nope we need each event to occur once in the formula, I think

-- disj (mk [1,2,3]) (mk [1,4,3,5])
-- disj (mk [2]) (mk [4,5])

-- What we are doing here is we are taking something that is in DNF
-- Computing the probability of a DNF is NP-hard

-- Can it always be factored into a tree?
-- Say we have to pull things out in two ways:
-- (A && B && C) || (A && B && D) || (B && D && E)
-- We want to factor A && B from the first two, but also B && D from the last two
-- (A && B && (C || D)) || (B && D && E)
-- And now the D is buried
-- (A && B && C) || (B && D && (A || E))
-- And now the A is buried

-- Okay let's do this differently. We're going to construct the graph, reverse the successor function and then compute all the paths
-- parents x = zipWith (\l r -> l ++ tail r) (tail (reverse (inits x))) (tail (reverse (tails x)))
-- reverseGraph :: Int -> Map Prog [Prog]
-- reverseGraph k = fromList $ map (ap (,) (nub . parents)) $ vertices (k+1)

computeAllPaths :: Prog -> Prog -> (Prog -> [Prog]) -> [[Prog]]
computeAllPaths src target graph
    | src == target = [[target]]
    | otherwise = concatMap (\p -> map (src:) (computeAllPaths p target graph)) (graph src)

allPaths :: Prog -> [[Prog]]
allPaths x = computeAllPaths [] x (\s -> findWithDefault [] s (graph (length x)))

-- Now you can take all these paths and replace them with named edges where each edge represents a [0] -> [0,0]
-- Map these paths to events 
-- Now each path is a set of conjunctions of events
-- Compute the inclusion exclusion formula symbolically
-- Verify that you get a family of under and overapproximations depending on how far you go
-- This will require choosing pairs and triples and so forth among the list and removing duplicate elements

pathsToEvents :: [[a]] -> [[(a, a)]]
pathsToEvents = map (ap zip tail)

combinations :: Int -> [a] -> [[a]]
combinations 0 _  = [ [] ]
combinations n xs = [ y:ys | y:xs' <- tails xs, ys <- combinations (n-1) xs']

inclusionExclusionTerm :: Eq a => Int -> [[a]] -> [[a]]
inclusionExclusionTerm k xs = combinations k xs >>= return . nub . concat

polynomial :: [[a]] -> [(Int, Int)]
polynomial = map (liftM2 (,) length head) . group . sort . map length

if' :: Bool -> a -> a -> a
if' True  x _ = x
if' False _ y = y

polynomialTerms :: Int -> Prog -> [(Int, Int)]
polynomialTerms k xs = concat $ map terms [1..k]
  where terms k = map (first (if' (even k) =<< negate)) $ polynomial $ inclusionExclusionTerm k events
        events = (pathsToEvents . allPaths) xs

evaluateAt :: (Floating a, Integral b) => a -> [(b, b)] -> a
evaluateAt p xs = sum $ map (\(x,y) -> (fromIntegral x) * (p ** (fromIntegral y))) xs

-- Notice how we alternate between over- and under-approximations...
-- λ> evaluateAt 0.5 $ polynomialTerms 1 [0,1,0,1]
-- 1.0
-- λ> evaluateAt 0.5 $ polynomialTerms 2 [0,1,0,1]
-- 0.0
-- λ> evaluateAt 0.5 $ polynomialTerms 3 [0,1,0,1]
-- 0.880859375
-- λ> evaluateAt 0.5 $ polynomialTerms 4 [0,1,0,1]
-- 0.1575927734375
-- λ> evaluateAt 0.5 $ polynomialTerms 5 [0,1,0,1]
-- 0.7041015625
-- λ> evaluateAt 0.5 $ polynomialTerms 6 [0,1,0,1]
-- 0.3328704833984375
-- λ> evaluateAt 0.5 $ polynomialTerms 7 [0,1,0,1]
-- 0.5550994873046875
-- λ> evaluateAt 0.5 $ polynomialTerms 8 [0,1,0,1]
-- 0.439422607421875
-- λ> evaluateAt 0.5 $ polynomialTerms 9 [0,1,0,1]
-- 0.49117279052734375
-- λ> evaluateAt 0.5 $ polynomialTerms 10 [0,1,0,1]
-- 0.47153759002685547
-- λ> evaluateAt 0.5 $ polynomialTerms 11 [0,1,0,1]
-- 0.47774600982666016
-- λ> evaluateAt 0.5 $ polynomialTerms 12 [0,1,0,1]
-- 0.4761490821838379

-- Code appears to be reasonably correct...
-- λ> estimate' 300000 [0,1,0]
-- 0.4302433333333333
-- λ> evaluateAt 0.5 $ bigPoly [0,1,0]
-- 0.4306640625

-- λ> evaluateAt 0.5 $ bigPoly [0,0,1]
-- 0.3046875
-- λ> estimate' 300000 [0,0,1]
-- 0.30575

-- λ> evaluateAt 0.5 $ bigPoly [0,0,0]
-- 0.125
-- λ> estimate' 300000 [0,0,0]
-- 0.12486

bigPoly :: Prog -> [(Int, Int)]
bigPoly xs = concat $ map terms [1..k]
  where terms k = map (first (if' (even k) =<< negate)) $ polynomial $ inclusionExclusionTerm k events
        events  = (pathsToEvents . allPaths) xs
        k       = length events

-- Looks good to me!
-- λ> evaluateAt 0.5 $ bigPoly [0,1,0,1]
-- 0.4764277935028076
-- λ> estimate' 300000 [0,1,0,1]
-- 0.47764666666666666

collapse :: [(Int,Int)] -> [(Int,Int)]
collapse = reverse . r . foldl f [] . r
  where r = map (uncurry (flip (,)))
        f xs (x,y) = case lookup x xs of
                       Just y' -> (x,y+y') : filter ((/= x) . fst) xs
                       Nothing -> (x,y) : xs
         
-- We should take this and plot it as a function of p

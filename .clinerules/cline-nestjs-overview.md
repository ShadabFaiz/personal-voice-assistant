directory:`mainServer` is Nestjs based. You need to follow folloing rules when you are doing anything is this directory:
1.  When you are asked to implement a function / Class / Module, check if there already exists or not.
    If there are existsing Class / function / module, check how it is implemented, and then create new ones based on it.
2.  Do not use type `any` anywhere. Alway define proper interfaces / types. Check if there is already interface directory within the given modules / service.
    If it exists, create the new interface there. If it does exits, create the directory.
3.  Follow dry-principle.
4.  Keep functions short and consice. 1 function must do only 1 task.
5.  After implementing it, you need to check if it is working properly or not. If it is not, fix it. iterate over it 5 times to fix it.
    If it is not fixed within 5 iteration. Stop it. Inform user about it.
6.  Every function must have its parameter (if it requires) and return types properly defined.
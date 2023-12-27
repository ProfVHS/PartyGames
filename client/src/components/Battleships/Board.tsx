

export default function Board() {

    const Rows = [1,2,3,4,5,6,7,8,9,10];
    const Columns = ["A","B","C","D","E","F","G","H","I","J"];

    return (
    <>
        <div className="board">
            {Rows.map((row) => {
                return (
                    Columns.map((column) => {
                        return (
                            <div className="boardSquare">
                                {column}{row}
                            </div>
                        )
                    })
                )
            })}
        </div>
    </>
    )
}

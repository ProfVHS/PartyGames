const Rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const Columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

export const Marks = () => {
  return (
    <>
      <div className="battleships__columns">
        {Columns.map((column) => {
          return (
            <div key={column} className="battleships__column">
              {column}
            </div>
          );
        })}
      </div>
      <div className="battleships__rows">
        {Rows.map((rows) => {
          return (
            <div key={rows} className="battleships__row">
              {rows}
            </div>
          );
        })}
      </div>
    </>
  );
};

(function () {
    function getCell(td) {
        return (
            td.querySelector(".mob-table__expand-content") ||
            td.querySelector(".cell") ||
            td
        )
    }

    function prepEnterRow(tr) {
        if (!tr || !tr.classList.contains("mob-table__body-row--entering")) {
            return
        }
        var tds = tr.querySelectorAll("td")
        angular.forEach(tds, function (td) {
            var cell = getCell(td)
            td.style.overflow = "hidden"
            td.style.transition = "none"
            td.style.paddingTop = "0px"
            td.style.paddingBottom = "0px"
            td.style.borderBottomWidth = "0px"
            cell.style.overflow = "hidden"
            cell.style.transition = "none"
            cell.style.boxSizing = "border-box"
            cell.style.height = "0px"
            cell.style.opacity = "0"
        })
    }

    app.factory("mobTableRowAnimUtil", function () {
        return {
            prepEnterRow: prepEnterRow,
            getCell: getCell,
        }
    })
})()

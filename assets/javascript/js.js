$(document).ready(function() {

    let tempStudentList = [];

    function parseURLParams(url) {
        var queryStart = url.indexOf("?") + 1,
            queryEnd   = url.indexOf("#") + 1 || url.length + 1,
            query = url.slice(queryStart, queryEnd - 1),
            pairs = query.replace(/\+/g, " ").split("&"),
            parms = {}, i, n, v, nv;
    
        if (query === url || query === "") return;
    
        for (i = 0; i < pairs.length; i++) {
            nv = pairs[i].split("=", 2);
            n = decodeURIComponent(nv[0]);
            v = decodeURIComponent(nv[1]);
    
            if (!parms.hasOwnProperty(n)) parms[n] = [];
            parms[n].push(nv.length === 2 ? v : null);
        }
        return parms;
    }

    if (!parseURLParams(window.location.href)) {
        let classname = prompt('What is the name of your class? (No Spaces)');
        if (classname != null || classname != "") {
            location.href = '?class=' + classname;
        } else {
            setTimeout(500);
            location.reload();
        }
    }

    var params = parseURLParams(window.location.href)
    var cookieName = params['class'][0]

    if (cookieName == 'null' || cookieName == '') {
        let classname = prompt('What is the name of your class? (No Spaces)');
        if (classname != null && classname != "") {
            location.href = '?class=' + classname;
        } else {
            setTimeout(500);
            location.reload();
        }
    }

    if (Cookies.get(cookieName)) {
        var students = JSON.parse(Cookies.get(cookieName));
    } else {
        var students = ['Add Permanant Students.']
    }
    
    // Block Special Characters
    function blockSpecialCharacters(query) {
        $(query).on('input', function() {
            var c = this.selectionStart,
            r = /[^a-z0-9]/gi,
            v = $(this).val();
            if(r.test(v)) {
                $(this).val(v.replace(r, ''));
                c--;
            }
            this.setSelectionRange(c, c);
        });
    }

    function nonRepeatingRandomNums(a, b) {
        var nums = [];

        //Populate Nums
        for (let x = a; x < b+1; x++) {
            nums.push(x);
        }
        
        var ranNums = [],
        i = nums.length,
        j = 0;
        
        while (i--) {
            j = Math.floor(Math.random() * (i+1));
            ranNums.push(nums[j]);
            nums.splice(j,1);
        }
        return ranNums;
    }
    
    $('#import').click(function() {
        let json = prompt('Class Code');
        let classname = prompt('Save to what class name')
        
        students = JSON.parse(json);
        Cookies.set(classname, JSON.stringify(students));
        location.href = '?class=' + classname;
    })

    $('#export').click( async function() {
        await window.navigator.clipboard
            .writeText(JSON.stringify(students))
            .then(() => {
                alert('Use this to transfer students to another computer, or to recover an existing class \n\n' + JSON.stringify(students))
            })
    })

    $('#changeClass').click(function() {
        let classname = prompt('Go to which class');
        while (classname == null && classname == "") {
            let classname = prompt('Go to which class');
        }
        location.href = '?class=' + classname;
    })

    var studentBar = $('#students')
    var absentBar = $('#students #absent #aswitches');
    $('#tempstudent').click(function() {
        if (!($("#tempname").length)) {
            studentBar.append('<input id="tempname">');
            studentBar.append('<button id="addtempstudent" class="addstudent">add</button>');
            blockSpecialCharacters('#tempname');
            $('#addtempstudent').click(function() {
                if ($('#tempname').length()) {
                    var studentName = $('#tempname').val();
                    $('#tempname').remove();
                    $('#addtempstudent').remove();
                    studentBar.append('<p>' + studentName + '</p>');
                    students.push(studentName);
                    tempStudentList.push(studentName);
                }
            });
        }
    });
    $('#permstudent').click(function() {
        if (!($("#permname").length)) {
        studentBar.append('<input id="permname">');
        studentBar.append('<button id="addpermstudent" class="addstudent">add</button>');
        blockSpecialCharacters('#permname');
        $('#addpermstudent').click(function() {
            if ($('#permname').val()) {
                    var studentName = $('#permname').val();
                    $('#permname').remove();
                    $('#addpermstudent').remove();
                    studentBar.append('<p>' + studentName + '</p>');
                    students.push(studentName);
                    var tempList = students;
                    for (let x = 0; x < tempStudentList; x++) {
                        if (students.includes(tempStudentList[x])) {
                            tempList.splice(x, 1);
                        }
                    }

                    if (tempList.includes('Add Permanant Students.')) {
                        tempList.splice(tempList.indexOf('Add Permanant Students.'), 1)
                        location.reload()
                    }
                    Cookies.set(cookieName, JSON.stringify(tempList));
                }
            });
        }
    });

    for (let x = 0; x < students.length; x++) {
        studentBar.append('<p>' + students[x] + '</p>');
        absentBar.append('<label class="switch" id="' + students[x] + 'a"></label>');
        $('#' + students[x] + 'a').append('<input type="checkbox">');
        $('#' + students[x] + 'a').append('<span class="slider round"></span>');
    }

    var addButton = $('#gnums #buts #add'),
    removeButton = $('#gnums #buts #remove'),
    randomButton = $('#randomize'),
    display = $('#gnums #display'),
    numofgroups = parseInt(display.text());

    $('#absent label input').click(function() {
        var student = $(this).parent().attr('id').slice(0, -1);
        var index = students.indexOf(student);
        if ($(this).prop('checked')) {
            students.splice(index, 1);
        } else {
            students.push(student);
        }
    })
    
    addButton.click(function() {
        if(numofgroups < 10) {
            display.text((numofgroups += 1).toString());
        }
    });

    removeButton.click(function() {
        if(numofgroups > 2) {
            display.text((numofgroups -= 1).toString());
        }
    });

    randomButton.click(function() {

        if (!students.includes('Add Permanant Students.')) {
            var randomStudents = [],
            randomIndexes = nonRepeatingRandomNums(0, students.length-1),
            student_group = {};
            for (let x = 0; x < students.length; x++) {
                randomStudents.push(students[randomIndexes[x]]);
            }
            var increment = 0;
            for (let x = 0; x < numofgroups; x++) {
                for (let y = 0; y < students.length / numofgroups; y++) {
                    student_group[randomStudents[increment]] = x
                    if (student_group.hasOwnProperty('undefined')) {
                        delete student_group['undefined']
                    }
                    increment += 1;
                }
            }
            for (let x = 0; x < 10; x++) {
                $('#g' + x).remove()
            }
            for (let x = 0; x < numofgroups; x++) {
                $('#main').append('<div id="g' + x + '" class="group"></div>')
                $('#g' + x).append('<p class="title">Group ' + (x+1) + '</p>')
                for ( let y in student_group) {
                    if (student_group[y] == x) {
                        $('#g' + x).append('<p>' + y + '</p>')
                    }
                }
            }
        }
    })
})
